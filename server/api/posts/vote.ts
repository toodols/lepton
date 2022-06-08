import { Request, Response } from "express";
import { posts } from "../../database";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const voteGuard = createGuard({
	post: Checkables.objectId,
	sign: Checkables.integer,
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = voteGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	const {sign, post: postid} = result.value; 

	if (sign !== -1 && sign !== 1 && sign !== 0) {
		return res.status(400).json({ error: "Invalid sign" });
	}

	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const uresult = await posts.updateOne({ _id: postid }, { $set: {
		[`voters.${user._id}`]: sign,
	} });
	if (uresult.acknowledged) {
		res.status(200).json({});
	} else {
		res.status(500).json({ error: "Failed to vote" });
	}
	
	
	// todo
}
