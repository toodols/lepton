import {Request, Response} from "express";
import { CommentData, UserDataPartial } from "lepton-client";
import { ObjectId } from "mongodb";
import { comments, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {Checkables, createGuard, Error} from "../util";

interface Data {
	users: Record<string, UserDataPartial>;
	comments: CommentData[]
};

const getCommentsGuard = createGuard({
	post: Checkables.objectId,
	before: Checkables.optional(Checkables.integer),
});

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = getCommentsGuard(req.query as any);
	if ("error" in result) return res.status(400).json({error: result.error});
	const value = result.value;

	const query: {createdAt?: any, post: ObjectId} = {
		post: value.post,
	}
	if (value.before) {
		query.createdAt = {$lt: value.before};
	};
	const findResult = await comments.find(query).limit(10).toArray();

	const usersRecognized: Record<string, boolean> = {};
	const arr: Promise<UserDataPartial>[] = [];
	for (const comment of findResult) {
		if (!usersRecognized[comment.author.id.toString()]) {			
			usersRecognized[comment.author.id.toString()] = true;
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
		users: dataMap,
		comments: findResult.map(Converter.toCommentData),
	}).status(200);
}
