import {Request, Response} from "express";
import type { UserData } from "lepton-client";
import { ObjectId } from "mongodb";
import { comments, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {assertAuthorization, assertBody, Error} from "../util";

interface Data {
	
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	if (assertBody({id: "string"}, req, res)) return;
	if (assertAuthorization(req, res)) return;

	const user = await users.findOne({token: req.headers.authorization})
	if (!user) return res.status(500).json({error: "Failed to find user"});
	
	const comment = await comments.findOne({_id: new ObjectId(req.body.id)})
	if (comment) {
		if (comment.author.equals(user._id)) {
			const deleteRes = await comments.deleteOne({_id: comment._id});
			if (deleteRes.acknowledged) {
				io.emit("commentDeleted", comment._id) // its automatically casted to a string just so i dont get confused
				res.status(200).json({})
			} else {
				res.status(500).json({error: "Failed to delete comment"});
			}
		}
	}
}
