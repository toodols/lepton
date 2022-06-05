import {Request, Response} from "express";
import type { UserDataPartial, PostData, CommentData } from "lepton-client";
import { comments, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {assertAuthorization, assertBody, Error} from "../util";

interface Data {
	users: Record<string, UserDataPartial>;
	posts: PostData[];
	comments: CommentData[];
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	const query: {createdAt?: any} = {}
	if (req.query.before) {
		query.createdAt = {$lt: req.query.before};
	};
	const result = await posts.find(query).sort({_id:-1}).limit(10).toArray();
	const commentDatas = await Promise.all(result.map(post=>{
		return comments.findOne({post: post._id}).then(comment=>comment?Converter.toCommentData(comment):undefined)
	})).then(e=>e.filter(e=>e)) as CommentData[];
	const usersRecognized: Record<string, boolean> = {};
	const arr: Promise<UserDataPartial>[] = [];
	for (const post of result) {
		if (!usersRecognized[post.author.id.toString()]) {			
			usersRecognized[post.author.id.toString()] = true;
			arr.push(users.findOne(post.author).then(value=>{
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
		posts: result.map(Converter.toPostData),
		comments: commentDatas,
	}).status(200);
}
