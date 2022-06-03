import {Request, Response} from "express";
import type { UserData, PostData } from "lepton-client";
import { posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {assertAuthorization, assertBody, Error} from "../util";

interface Data {
	users: Record<string, UserData>;
	posts: PostData[]
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	const query: {createdAt?: any} = {}
	if (req.query.before) {
		query.createdAt = {$lt: req.query.before};
	};
	const result = await posts.find(query).sort({_id:-1}).limit(10).toArray();

	const usersRecognized: Record<string, boolean> = {};
	const arr: Promise<UserData>[] = [];
	for (const post of result) {
		if (!usersRecognized[post.author.id.toString()]) {			
			usersRecognized[post.author.id.toString()] = true;
			arr.push(users.findOne(post.author).then(value=>{
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
		posts: result.map(Converter.toPostData),
	}).status(200);
}
