import {Request, Response} from "express";
import type { UserDataPartial, PostData, CommentData, Comment } from "lepton-client";
import { Timestamp, WithId } from "mongodb";
import { comments, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import {assertAuthorization, assertBody, assertQuery, Error} from "../util";

interface Data {
	users: Record<string, UserDataPartial>;
	posts: PostData[];
	comments: CommentData[];
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	const query: {createdAt?: any} = {}
	if (req.query.before) {
		if (isNaN(parseInt(String(req.query.before)))) {
			res.status(400).json({error: `"before" must be a number`});
			return;
		}
		query.createdAt = {$lt: Timestamp.fromNumber(parseInt(String(req.query.before)))};
	};
	const result = await posts.find(query).sort({_id:-1}).limit(10).toArray();
	let unfiltered = await Promise.all(result.map(post=>{
		return comments.findOne({post: post._id}, {sort: {_id: -1}});
	}))
	const commentResults = unfiltered.filter(comment=>comment) as Exclude<(typeof unfiltered)[number], null>[];

	const usersRecognized: Record<string, boolean> = {};
	const arr: Promise<UserDataPartial>[] = [];
	for (const post of result) {
		if (!usersRecognized[post.author.toString()]) {			
			usersRecognized[post.author.toString()] = true;
			arr.push(users.findOne(post.author).then(value=>{
				return Converter.toUserDataPartial(value!);
			}));
		}
	}
	for (const comment of commentResults) {
		if (!usersRecognized[comment.author.toString()]) {
			usersRecognized[comment.author.toString()] = true;
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
		posts: result.map(Converter.toPostData),
		comments: commentResults.map(Converter.toCommentData),
	}).status(200);
}
