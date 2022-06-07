import { createHash } from "crypto";
import type { PostData, UserDataPartial, CommentData, UserDataFull, GroupData, ClientInfoData } from "lepton-client";
import { ObjectId, WithId } from "mongodb";
import { DatabaseTypes } from "./database";

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
	export function toPostData(post: WithId<DatabaseTypes.Post>): PostData {
		return {
			createdAt: post.createdAt.toNumber(),
			updatedAt: post.updatedAt.toNumber(),
			id: post._id.toString(),
			content: post.content,
			author: post.author.toString(),
			group: post.group?.toString(),
		}
	}
	export function toGroupDataFull(group: WithId<DatabaseTypes.Group>): GroupData {
		return {
			id: group._id.toString(),
			name: group.name,
			createdAt: group.createdAt.toNumber(),
			updatedAt: group.updatedAt.toNumber(),
			icon: group.icon,
		}
	}
	export function toUserDataPartial(user: WithId<DatabaseTypes.User>): UserDataPartial {
		return {
			createdAt: user.createdAt.toNumber(),
			id: user._id.toString(),
			username: user.username,
			avatar: user.settings.avatar,
		}
	}
	export function toUserDataFull(user: WithId<DatabaseTypes.User>): UserDataFull {
		return {
			...toUserDataPartial(user),
			description: user.settings.description,
		}
	}
	export function toClientInfoData(user: WithId<DatabaseTypes.User>): ClientInfoData {
		return {
			groups: user.groups.map(g => g.toString()),
		}
	}

	export function toCommentData(comment: WithId<DatabaseTypes.Comment>): CommentData {
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
