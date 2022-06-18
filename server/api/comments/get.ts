import { Request, Response } from "express";
import { CommentData, UserDataPartial } from "lepton-client";
import { ObjectId, Timestamp } from "mongodb";
import { comments, users } from "../../database";
import { Converter } from "../../util";
import { Checkables, createGuard, Error } from "../util";

interface Data {
	users: Record<string, UserDataPartial>;
	comments: CommentData[];
	hasMore: boolean;
};

const getCommentsGuard = createGuard({
	post: Checkables.objectId,
	before: Checkables.optional(Checkables.integer),
});

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = getCommentsGuard(req.query as any);
	if ("error" in result) return res.status(400).json(result);
	const value = result.value;

	const query: {createdAt?: any, post: ObjectId} = {
		post: value.post,
	}
	if (value.before) {
		query.createdAt = {$lt: Timestamp.fromNumber(value.before)};
	};
	const amountToLoad = 30;
	const findResult = await comments.find(query, {sort: {createdAt: -1}}).limit(amountToLoad+1).toArray();
	const hasMore = findResult.length > amountToLoad;
	const actualFindResult = findResult.slice(0, amountToLoad);
	const usersRecognized: Record<string, boolean> = {};
	const arr: Promise<UserDataPartial>[] = [];
	for (const comment of actualFindResult) {
		if (!usersRecognized[comment.author.toString()]) {			
			usersRecognized[comment.author.toString()] = true;
			arr.push(users.findOne({_id: comment.author}).then(value=>{
				return Converter.toUserDataPartial(value!);
			}));
		}
	}

	const dataMap: Record<string, UserDataPartial> = {}
	for (const data of await Promise.all(arr)) {
		dataMap[data.id] = data;
	};

	res.json({
		hasMore,
		users: dataMap,
		comments: actualFindResult.map(Converter.toCommentData),
	}).status(200);
}
