import { Request, Response } from "express";
import { DeleteResult, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { DatabaseTypes, posts, votes } from "../../database";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const voteGuard = createGuard({
	post: Checkables.objectId,
	value: Checkables.integer,
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = voteGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	const {value, post: postid} = result.value; 

	if (value !== -1 && value !== 1 && value !== 0) {
		return res.status(400).json({ error: "Value must be -1, 1, or 0" });
	}

	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const post = await posts.findOne({ _id: postid });
	if (!post) return res.status(404).json({ error: "Post not found" });

	const vote = await votes.findOne({
		user: user._id,
		post: postid,
	})
	
	let databaseResult: UpdateResult | DeleteResult | InsertOneResult
	if (vote) {
		if (value === 0) {
			databaseResult = await votes.deleteOne({
				_id: vote._id,
			});
		} else {
			databaseResult = await votes.updateOne({_id: vote._id}, {$set: {sign: value}});
		}
	} else {
		if (value === 0) {
			return res.json({})
		} else {
			databaseResult = await votes.insertOne({
				user: user._id,
				post: postid,
				value: value,
			});
		}
	}

	if (databaseResult.acknowledged) {
		res.status(200).json({});
	} else {
		res.status(500).json({ error: "Failed to vote" });
	}
}
