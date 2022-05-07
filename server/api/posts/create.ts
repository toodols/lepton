import {Request, Response} from "express";
import { posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {assertAuthorization, assertBody, Error} from "../util";

interface Data {
	
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	if (assertBody({content: "string"}, req, res)) return;
	if (assertAuthorization(req, res)) return;

	const user = await users.findOne({token: req.headers.authorization})
	if (user) {
		const post = await posts.insertOne({
			content: req.body.content as string,
			author: user._id,
			group: req.body.group,
		})

		
		if (post.acknowledged) {
			io.emit("post", {
				post: Converter.toPostData({
					_id: post.insertedId,
					content: req.body.content as string,
					author: user._id,
				}),
				author: Converter.toUserData(user),
			})
			res.status(200).json({})
		} else {
			res.status(500).json({error: "Failed to create post"});
		}
	} else {
		res.status(400)
	}
}
