import { Request, Response } from "express";
import { friendRequests, users } from "../../database";
import { Checkables, createGuard, getUserFromAuth } from "../util";
import { Error } from "../util";

const unfriendGuard = createGuard({
	user: Checkables.objectId,
})

interface Data {}

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = unfriendGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	const target = result.value.user;
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	if (user.friends.find(id => id.equals(target))) {
		const updateResult = await users.updateOne({ _id: user._id }, { $pull: { friends: target } });
		const update2Result = await users.updateOne({ _id: target }, { $pull: { friends: user._id } });
		if (updateResult.modifiedCount === 0 || update2Result.modifiedCount === 0) {
			return res.status(500).json({ error: `Failed to unfriend user: ${updateResult.acknowledged} target: ${update2Result.acknowledged}` });
		}
		return res.json({})
	}
	return res.status(400).json({ error: "Not friends" });
}