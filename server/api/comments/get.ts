import {Request, Response} from "express";
import type { UserData, PostData, CommentData } from "lepton-client";
import { comments, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {assertAuthorization, assertBody, Error} from "../util";

interface Data {
	users: Record<string, UserData>;
	comments: CommentData[]
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	const query: {createdAt?: any} = {}
	if (req.query.before) {
		query.createdAt = {$lt: req.query.before};
	};
	const result = await comments.find(query).sort({_id:-1}).limit(10).toArray();

	const usersRecognized: Record<string, boolean> = {};
	const arr: Promise<UserData>[] = [];
	for (const comment of result) {
		if (!usersRecognized[comment.author.id.toString()]) {			
			usersRecognized[comment.author.id.toString()] = true;
			arr.push(users.findOne(comment.author).then(value=>{
				return Converter.toUserData(value!);
			}));
		}
	}

	const dataMap: Record<string, UserData> = {}
	for (const data of await Promise.all(arr)) {
		dataMap[data.id] = data;
	};

	res.json({
		users: dataMap,
		comments: result.map(Converter.toCommentData),
	}).status(200);
}
