import {Request, Response} from "express";
import { ObjectId } from "mongodb";
import { comments } from "../../database";
import { io } from "../../server-entry";
import { Checkables, createGuard, Error, getUserFromAuth} from "../util";

interface Data {
	
};

const editCommentGuard = createGuard({
	id: Checkables.objectId,
	content: Checkables.string
});


export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = editCommentGuard(req.body);
	if ("error" in result) return res.status(400).json(result);

	const user = await getUserFromAuth(req, res);
	if (!user) return;
	
	const comment = await comments.findOne({_id: new ObjectId(result.value.id)})
	if (!comment) return void res.status(400).json({error: "Comment not found"});
	if (!comment.author.equals(user._id)) return void res.status(403).json({error: "You are not the author of this comment"});

	const editRes = await comments.updateOne({_id: comment._id}, {$set: {content: result.value.content}});
	if (editRes.acknowledged) {
		io.emit("commentEdited", comment._id) // its automatically casted to a string just so i dont get confused
		res.status(200).json({})
	} else {
		res.status(500).json({error: "Failed to edit comment"});
	}
}
