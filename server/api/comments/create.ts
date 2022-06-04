import { Request, Response } from "express";
import { ObjectId, Timestamp } from "mongodb";
import { comments, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import { assertAuthorization, assertBody, Error } from "../util";

interface Data {}

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	if (assertBody({ content: "string", post: "string" }, req, res)) return;
	if (assertAuthorization(req, res)) return;

	const user = await users.findOne({ token: req.headers.authorization });
	if (!user) return res.status(400).json({ error: "User not found" });
	const post = await posts.findOne({ _id: new ObjectId(req.body.post) });

	if (post) {
		const comment = await comments.insertOne({
			content: req.body.content,
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
				author: Converter.toUserData(user),
			});
			res.status(200).json({});
		} else {
			res.status(500).json({ error: "Failed to create comment" });
		}
	} else {
		res.status(400).json({ error: "Post not found" });
	}
}
