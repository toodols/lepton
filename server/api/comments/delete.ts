import {Request, Response} from "express";
import { ObjectId } from "mongodb";
import { auth, comments, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {assertAuthorization, assertBody, Error, getUserFromAuth} from "../util";

interface Data {
	
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	if (assertBody({id: "string"}, req, res)) return;

	const user = await getUserFromAuth(req, res);
	if (!user) return;
	
	const comment = await comments.findOne({_id: new ObjectId(req.body.id)})
	if (!comment) return void res.status(400).json({error: "Comment not found"});
	if (!comment.author.equals(user._id)) return void res.status(403).json({error: "You are not the author of this comment"});

	const deleteRes = await comments.deleteOne({_id: comment._id});
	if (deleteRes.acknowledged) {
		io.emit("commentDeleted", comment._id) // its automatically casted to a string just so i dont get confused
		res.status(200).json({})
	} else {
		res.status(500).json({error: "Failed to delete comment"});
	}
}
