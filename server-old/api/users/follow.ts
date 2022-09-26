import { Request, Response } from "express";
import { Timestamp } from "mongodb";
import { follows } from "../../database";
import { Checkables, createGuard, getUserFromAuth } from "../util";
import { Error } from "../util";

const followGuard = createGuard({
	user: Checkables.objectId,
})

interface Data {
	alreadyFollowed: boolean
}

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = followGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const follow = await follows.findOne({
		user: user._id,
		follower: result.value.user,
	});
	if (follow) {
		res.json({
			alreadyFollowed: true,
		})
	} else {
		const iresult = await follows.insertOne({
			user: user._id,
			follower: result.value.user,
			createdAt: Timestamp.fromNumber(Date.now()),
		})
		if (iresult.acknowledged) {
			res.json({
				alreadyFollowed: false,
			})
		} else {
			res.status(500).json({
				error: "Failed to follow",
			})
		}
	}
}