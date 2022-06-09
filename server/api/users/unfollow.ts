import { Request, Response } from "express";
import { follows } from "../../database";
import { Checkables, createGuard, getUserFromAuth } from "../util";
import { Error } from "../util";

const unfollowGuard = createGuard({
	user: Checkables.objectId,
})

interface Data {
	alreadyUnfollowed: boolean
}

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = unfollowGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const follow = await follows.findOne({
		user: user._id,
		follower: result.value.user,
	});
	if (follow) {
		const dresult = await follows.deleteOne({
			_id: follow._id,
		});
		if (dresult.acknowledged) {
			res.json({
				alreadyUnfollowed: false,
			})
		} else {
			res.status(500).json({
				error: "Failed to unfollow",
			})
		}
	} else {
		res.json({
			alreadyUnfollowed: true,
		})
	}
}