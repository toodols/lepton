import {Request, Response} from "express";
import { CommentData, UserDataPartial } from "lepton-client";
import { ObjectId } from "mongodb";
import { comments, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {assertAuthorization, assertBody, assertQuery, Error} from "../util";

interface Data {
	users: Record<string, UserDataPartial>;
	comments: CommentData[]
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	if (assertQuery({post: "string"}, req, res)) return;
	const query: {createdAt?: any, post: ObjectId} = {
		post: new ObjectId(req.query.post as string),
	}
	if (req.query.before) {
		query.createdAt = {$lt: req.query.before};
	};
	const result = await comments.find(query).limit(10).toArray();

	const usersRecognized: Record<string, boolean> = {};
	const arr: Promise<UserDataPartial>[] = [];
	for (const comment of result) {
		if (!usersRecognized[comment.author.id.toString()]) {			
			usersRecognized[comment.author.id.toString()] = true;
			arr.push(users.findOne(comment.author).then(value=>{
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
		comments: result.map(Converter.toCommentData),
	}).status(200);
}
