import { Request, Response } from "express";
import { PollData } from "lepton-client";
import { ObjectId, Timestamp, WithId } from "mongodb";
import { DatabaseTypes, groups, groupUsers, polls, posts } from "../../database";
import { io, redisClient } from "../../server-entry";
import { Converter, toGroup } from "../../util";
import { Checkable, Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const createPostGuard = createGuard({
	content: Checkables.string,
	attachments: Checkables.optional(Checkables.array<{type: "image", url: string} | {type: "poll", options: string[], question: string}>((input: unknown) =>{
		if (input===null || typeof input !== "object") return {error: "Attachments must be an array of objects"};
		if ("type" in input) {
			const t = (input as {type: string}).type;
			if (t === "image") {
				//@ts-ignore;
				const url = input.url;
				if (typeof url !== "string") {
					return {error: "Image attachments must have a url property"};
				}
				const parsed = new URL(url);
				if (parsed.hostname !== "cdn.discordapp.com") {
					return {error: "Bad host"};
				};

				return {
					value: {
					type: "image",
					url: parsed.href,
				}}
			} else if (t === "poll") {
				//@ts-ignore;
				const options = input.options;
				if (!Array.isArray(options)) {
					return {error: "Poll attachments must have an options property"};
				}
				//@ts-ignore;
				if (typeof input.question !== "string") {
					return {error: "Poll attachments must have a questions property"};
				}
				const opts: string[] = [];
				for (const opt of options) {
					if (typeof opt !== "string") {
						return {error: "Poll option is not a string"};
					}
					opts.push(opt);
				}
				return {value: {
					type: "poll",
					options: opts,
					question: (input as {question: string}).question,
				}}
			} else {
				return {error: "Unknown attachment type"};
			}
		} else {
			return {error: "Missing type field in attachment"};
		}
	})),
	group: Checkables.optional(Checkables.objectId)
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = createPostGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	// check if group exists
	if (result.value.group) {
		const group = await groups.findOne({ _id: result.value.group });
		if (group) {
			if (!group.isPublic) { 
				const member = await groupUsers.findOne({
					group: result.value.group,
					user: user._id
				})
				if (!member) {
					return res.status(400).json({ error: "Group does not exist" });
				}
			}
		} else {
			return res.status(400).json({ error: "Group does not exist" });
		}
	}
	const attachments: ({
		type: "image",
		url: string
	} | {
		type: "poll",
		id: ObjectId,
	})[] = [];
	for (const attachment of result.value.attachments || []) {
		if (attachment.type === "image") {
			attachments.push({
				type: "image",
				url: attachment.url,
			});
		} else if (attachment.type === "poll") {
			const poll = await polls.insertOne({
				options: attachment.options,
				question: attachment.question,
			})
			if (!poll.acknowledged) {
				return res.status(500).json({ error: "Failed to create poll" });
			}
			// redis poll cache here
			attachments.push({
				type: "poll",
				id: poll.insertedId,
			});
		}
	};
	
	
	const post = await posts.insertOne({
		content: result.value.content,
		author: user._id,
		group: result.value.group ?? undefined,
		votes: 0,
		createdAt: Timestamp.fromNumber(Date.now()),
		updatedAt: Timestamp.fromNumber(Date.now()),
		attachments,
	});

	if (post.acknowledged) {
		redisClient.multi().hSet("post:"+post.insertedId, "votes", 0).expire("post:"+post.insertedId, 60).exec();
		const data = await posts.findOne({ _id: post.insertedId });
		const pollAttachments = attachments.filter(a => a.type === "poll") as {type: "poll", id: ObjectId}[];
		const pollsMap: Record<string, PollData> = {};
		for (const p of await Promise.all(pollAttachments.map(poll=>{
			return polls.findOne({ _id: poll.id });
		}))) {
			if (!p) {
				return res.status(500).json({ error: "Failed to find poll" });
			}
			pollsMap[p._id.toString()] = Converter.toPollData(p);
		};
		toGroup(result.value.group).emit("post", {
				post: await Converter.toPostData(data!),
				polls: pollsMap,
				author: Converter.toUserDataPartial(user),
		});
		
		res.status(200).json({});
	} else {
		res.status(500).json({ error: "Failed to create post" });
	}
}
