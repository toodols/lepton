import { Request, Response } from "express";
import { Timestamp } from "mongodb";
import { posts } from "../../database";
import { io } from "../../server-entry";
import { Converter } from "../../util";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const createPostGuard = createGuard({
	content: Checkables.string,
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
	
	const post = await posts.insertOne({
		content: result.value.content,
		author: user._id,
		group: result.value.group ?? undefined,
		votes: 0,
		voters: {},
		createdAt: Timestamp.fromNumber(Date.now()),
		updatedAt: Timestamp.fromNumber(Date.now()),
	});

	if (post.acknowledged) {
		const data = await posts.findOne({ _id: post.insertedId });
		if (result.value.group) {
			io.to("group:"+result.value.group).emit("post", {
				post: Converter.toPostData(data!),
				author: Converter.toUserDataPartial(user),
			});
		} else {
			io.emit("post", {
				post: Converter.toPostData(data!),
				author: Converter.toUserDataPartial(user),
			});
		}
		res.status(200).json({});
	} else {
		res.status(500).json({ error: "Failed to create post" });
	}
}
