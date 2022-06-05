import { Request, Response } from "express";
import { Timestamp } from "mongodb";
import { auth, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import { assertAuthorization, assertBody, Error, getUserFromAuth } from "../util";

interface Data {}

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	if (assertBody({ content: "string" }, req, res)) return;
	if (assertAuthorization(req, res)) return;

	const user = await getUserFromAuth(req, res);
	if (!user) return;
	
	const post = await posts.insertOne({
		content: req.body.content as string,
		author: user._id,
		group: req.body.group,
		createdAt: Timestamp.fromNumber(Date.now()),
		updatedAt: Timestamp.fromNumber(Date.now()),
	});

	if (post.acknowledged) {
		const data = await posts.findOne({ _id: post.insertedId });
		io.emit("post", {
			post: Converter.toPostData(data!),
			author: Converter.toUserDataPartial(user),
		});
		res.status(200).json({});
	} else {
		res.status(500).json({ error: "Failed to create post" });
	}
}
