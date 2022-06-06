import {Request, Response} from "express";
import { ObjectId } from "mongodb";
import { auth, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {Checkables, createGuard, Error, getUserFromAuth} from "../util";

interface Data {
	
};

const deletePostGuard = createGuard({
	id: Checkables.objectId
});

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = deletePostGuard(req.body);
	if ("error" in result) return res.status(400).json({error: result.error});
	
	const user = await getUserFromAuth(req, res);
	if (!user) return;
	const post = await posts.findOne({_id: new ObjectId(result.value.id)})

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
