import {Request, Response} from "express";
import { ObjectId } from "mongodb";
import { comments } from "../../database";
import { io } from "../../server-entry";
import { Checkables, createGuard, Error, getUserFromAuth} from "../util";

interface Data {
	
};

const deleteCommentGuard = createGuard({
	id: Checkables.objectId
});


export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = deleteCommentGuard(req.body);
	if ("error" in result) return res.status(400).json({error: result.error});

	const user = await getUserFromAuth(req, res);
	if (!user) return;
	
	const comment = await comments.findOne({_id: new ObjectId(result.value.id)})
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
