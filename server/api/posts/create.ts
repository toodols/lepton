import { Request, Response } from "express";
import { Timestamp, WithId } from "mongodb";
import { DatabaseTypes, groups, posts } from "../../database";
import { io, redisClient } from "../../server-entry";
import { Converter, toGroup } from "../../util";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const createPostGuard = createGuard({
	content: Checkables.string,
	attachments: Checkables.array(Checkables.or([
		createGuard({
			type: Checkables.enums<"image" | "poll">(["image", "poll"]),
		})
	])),
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
		// if group is private and user is not in group, return error
		if (!group || (!group.isPublic && !group.members.includes(user._id))) {
			return res.status(400).json({ error: "Group not found" }); //403?
		}
	}
	
	const post = await posts.insertOne({
		content: result.value.content,
		author: user._id,
		group: result.value.group ?? undefined,
		votes: 0,
		createdAt: Timestamp.fromNumber(Date.now()),
		updatedAt: Timestamp.fromNumber(Date.now()),
	});

	if (post.acknowledged) {
		redisClient.multi().hSet("post:"+post.insertedId, "votes", 0).expire("post:"+post.insertedId, 60).exec();
		const data = await posts.findOne({ _id: post.insertedId });
		toGroup(result.value.group).emit("post", {
				post: await Converter.toPostData(data!),
				author: Converter.toUserDataPartial(user),
		});
		
		res.status(200).json({});
	} else {
		res.status(500).json({ error: "Failed to create post" });
	}
}
