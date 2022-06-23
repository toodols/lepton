import {Request, Response} from "express";
import type { UserDataPartial, PostData, CommentData } from "lepton-client";
import { Filter, Timestamp, WithId } from "mongodb";
import { comments, DatabaseTypes, posts, users } from "../../database";
import { Converter } from "../../util";
import {Checkables, createGuard, Error} from "../util";

interface Data {
	users: Record<string, UserDataPartial>;
	posts: PostData[];
	comments: CommentData[];
	hasMore: boolean;
};

const getPostsGuard = createGuard({
	before: Checkables.optional(Checkables.integer),
	group: Checkables.optional(Checkables.objectId),
	user: Checkables.optional(Checkables.objectId),
})

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = getPostsGuard(req.query as any);
	if ("error" in result) return res.status(400).json(result);
	const {before, group, user} = result.value;
	const query: Filter<DatabaseTypes.Post> = {};
	if (before) query.createdAt = {$lt: Timestamp.fromNumber(before)};
	if (user) {
		query.author = user;
	}
	if (group) {
		query.group = group
	} else {
		// group is null
		query.group = {$eq: null}
	};
	const amountToLoad = 10;
	const postsResult = await posts.find(query).sort({updatedAt:-1}).limit(amountToLoad+1).toArray();
	const hasMore = postsResult.length > amountToLoad;
	const actualPostsResult = postsResult.slice(0, amountToLoad);
	let unfiltered = await Promise.all(actualPostsResult.map(post=>comments.findOne({post: post._id}, {sort: {_id: -1}})));

	const commentResults = unfiltered.filter(comment=>comment) as WithId<DatabaseTypes.Comment>[]

	const usersRecognized: Record<string, boolean> = {};
	const arr: Promise<UserDataPartial>[] = [];
	for (const post of actualPostsResult) {
		if (!usersRecognized[post.author.toString()]) {			
			usersRecognized[post.author.toString()] = true;
			arr.push(users.findOne({_id: post.author}).then(value=>{
				return Converter.toUserDataPartial(value!);
			}));
		}
	}
	for (const comment of commentResults) {
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
		posts: await Promise.all(actualPostsResult.map(Converter.toPostData)),
		comments: commentResults.map(Converter.toCommentData),
	}).status(200);
}
