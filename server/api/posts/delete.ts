import {Request, Response} from "express";
import { ObjectId } from "mongodb";
import { auth, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {assertAuthorization, assertBody, Error, getUserFromAuth} from "../util";

interface Data {
	
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	if (assertBody({id: "string"}, req, res)) return;

	const user = await getUserFromAuth(req, res);
	if (!user) return;
	const post = await posts.findOne({_id: new ObjectId(req.body.id)})

	if (post) {
		if (post.author.equals(user._id)) {
			const deleteRes = await posts.deleteOne({_id: post._id});
			if (deleteRes.acknowledged) {
				io.emit("postDeleted", post._id) // its automatically casted to a string just so i dont get confused
				res.status(200).json({})
			} else {
				res.status(500).json({error: "Failed to delete post"});
			}
		}
	}
}
