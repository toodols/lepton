import { createHash } from "crypto";
import type { PostData, UserData, CommentData } from "lepton-client";
import { ObjectId, WithId } from "mongodb";
import { Post, Comment, User } from "./database";

export function salt(){
	return Math.floor(Math.random()*9999999999).toString(16)
}

export function hash(password: string, salt: string) {
	return createHash("sha256").update(password).update(salt).digest("hex");
}

export function token(){
	return Math.floor(Math.random()*9999999999).toString(16)
}

export namespace Converter {
	export function toPostData(post: WithId<Post>): PostData {
		return {
			id: post._id.toString(),
			content: post.content,
			author: post.author.toString(),
			group: post.group?.toString(),
		}
	}
	export function toUserData(user: WithId<User>): UserData {
		return {
			id: user._id.toString(),
			username: user.username,
		}
	}

	export function toCommentData(comment: WithId<Comment>): CommentData {
		return {
			id: comment._id.toString(),
			content: comment.content,
			author: comment.author.toString(),
			post: comment.post.toString(),
		}
	}
}
