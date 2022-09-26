import { Request, Response } from "express";
import { DeleteResult, InsertOneResult, UpdateResult, WithId } from "mongodb";
import { io, redisClient } from "../../server-entry";
import { toGroup } from "../../util";
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

	const uResult = await votes.findOneAndUpdate({
		post: postid,
		user: user._id,
	}, {
		$set: {
			value,
		},
	}, {
		upsert: true,
	})

	if (uResult.ok) {
		let change = value - (uResult.value?.value ?? 0);
		redisClient.hIncrBy(`post:${postid}`, "votes", change);
		toGroup(post.group).emit("votesChanged", post._id.toString(), change)
		res.json({});
	}
}
