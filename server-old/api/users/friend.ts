import { Request, Response } from "express";
import { friendRequests, users } from "../../database";
import { Checkables, createGuard, getUserFromAuth } from "../util";
import { Error } from "../util";

const friendGuard = createGuard({
	user: Checkables.objectId,
})

interface Data {
	accepted?: true,
}

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = friendGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	const target = result.value.user;
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	if (user._id.equals(target)) {
		return res.status(400).json({ error: "Cannot add yourself as a friend" });
	}

	// check if a friend request from the other person already exists
	const request = await friendRequests.findOne({
		$or: [{
			from: user._id,
			to: target
		}, {
			to: user._id,
			from: target
		}]
	})

	console.log(request);
	if (request) {
		if (request.to.equals(user._id)) {
			const deleteResult = await friendRequests.deleteOne({ _id: request._id });
			const updateResult = await users.updateOne({ _id: user._id }, { $addToSet: { friends: target } });
			const update2Result = await users.updateOne({ _id: target }, { $addToSet: { friends: user._id } });
			if (deleteResult.deletedCount === 0 || updateResult.modifiedCount === 0 || update2Result.modifiedCount === 0) {
				return res.status(500).json({ error: "Failed to accept friend request" });
			}
			return res.json({accepted: true})
		} else if (request.from.equals(user._id)) {
			return res.status(400).json({ error: "You already have an outgoing friend request to this user" });
		}
	}

	// check if the other person is already a friend
	const friend = await users.findOne({
		_id: target,
	});
	if (!friend) {
		return res.status(400).json({ error: "User not found" });
	}
	if (friend.friends.includes(user._id)) {
		return res.status(400).json({ error: "Already friends" });
	}

	// create a friend request
	const iResult = await friendRequests.insertOne({
		from: user._id,
		to: target,
	});
	if (iResult.acknowledged === false) {
		return res.status(500).json({ error: "Failed to send friend request" });
	}
	return res.json({})
}