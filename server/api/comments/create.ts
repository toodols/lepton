import { Request, Response } from "express";
import { ObjectId, Timestamp } from "mongodb";
import { comments, posts } from "../../database";
import { io } from "../../server-entry";
import { Converter } from "../../util";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const createCommentGuard = createGuard({
	content: Checkables.string,
	post: Checkables.objectId
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {

	const result = createCommentGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });


	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const post = await posts.findOne({ _id: new ObjectId(result.value.post) });

	if (post) {
		const comment = await comments.insertOne({
			content: result.value.content,
			author: user._id,
			post: post._id,
			createdAt: Timestamp.fromNumber(Date.now()),
			updatedAt: Timestamp.fromNumber(Date.now()),
		});
		
		if (comment.acknowledged) {
			const data = await comments.findOne({ _id: comment.insertedId });
			io.emit("comment", {
				post: post._id.toString,
				comment: Converter.toCommentData(data!),
				author: Converter.toUserDataPartial(user),
			});
			res.status(200).json({});
		} else {
			res.status(500).json({ error: "Failed to create comment" });
		}
	} else {
		res.status(400).json({ error: "Post not found" });
	}
}
