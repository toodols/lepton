import { Request, Response } from "express";
import { Timestamp, WithId } from "mongodb";
import { DatabaseTypes, follows, users } from "../../database";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

const getFollowersGuard = createGuard({
	user: Checkables.objectId,
	before: Checkables.optional(Checkables.integer),
})
interface Data {
	follows: WithId<DatabaseTypes.User>[]
}

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = getFollowersGuard(req.query as any);
	if ("error" in result) return res.status(400).json({ error: result.error });

	const { user, before } = result.value;

	// createdAt less than before
	const followers = await follows.aggregate([
		{ $match:{ user, ...(before?{createdAt: {$lt: before} }:{}) }},
		{ $sort: { createdAt: -1 } },
		{ $limit: 10 },
		{ $lookup: {
			from: "users",
			localField: "follower",
			foreignField: "_id",
			as: "follower",
		} },
		{ $unwind: "$follower" },
	]).toArray();

	res.json({
		follows: followers as WithId<DatabaseTypes.User>[],
	});
}