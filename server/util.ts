import { createHash } from "crypto";
import type { PostData, UserDataPartial, CommentData, UserDataFull } from "lepton-client";
import { ObjectId, WithId } from "mongodb";
import { Post, Comment, User } from "./database";

function hex(n: number){
	let s = "";
	for (let i = 0; i < n; i++) {
		s+=Math.floor(Math.random()*16).toString(16);
	}
	return s;
}

export function salt(){
	return hex(16);
}

export function hash(password: string, salt: string) {
	return createHash("sha256").update(password).update(salt).digest("hex");
}

export function token(){
	return hex(16);
}

export namespace Converter {
	export function toPostData(post: WithId<Post>): PostData {
		return {
			createdAt: post.createdAt.toNumber(),
			updatedAt: post.updatedAt.toNumber(),
			id: post._id.toString(),
			content: post.content,
			author: post.author.toString(),
			group: post.group?.toString(),
		}
	}
	export function toUserDataPartial(user: WithId<User>): UserDataPartial {
		return {
			createdAt: user.createdAt.toNumber(),
			id: user._id.toString(),
			username: user.username,
			avatar: user.settings.avatar,
		}
	}
	export function toUserDataFull(user: WithId<User>): UserDataFull {
		return {
			createdAt: user.createdAt.toNumber(),
			id: user._id.toString(),
			username: user.username,
			avatar: user.settings.avatar,
			description: user.settings.description,
		}
	}

	export function toCommentData(comment: WithId<Comment>): CommentData {
		return {
			createdAt: comment.createdAt.toNumber(),
			updatedAt: comment.updatedAt.toNumber(),
			id: comment._id.toString(),
			content: comment.content,
			author: comment.author.toString(),
			post: comment.post.toString(),
		}
	}
}
