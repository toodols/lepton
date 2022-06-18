import { createHash } from "crypto";
import type { PostData, UserDataPartial, CommentData, UserDataFull, GroupData, ClientInfoData, ItemData } from "lepton-client";
import { ObjectId, WithId } from "mongodb";
import { Socket } from "socket.io";
import { DatabaseTypes, posts, votes } from "./database";
import { io, redisClient } from "./server-entry";

export function hex(n: number){
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

async function getVotes(id: ObjectId): Promise<number> {
	const result = await redisClient.hGet("post:"+id, "votes")
	if (result) {
		return parseInt(result)
	}
	const p = await votes.aggregate([
			{$match: {post: id}},
			{$group: {_id: null, sum: {$sum: "$value"}}}
		]
	).toArray().then(e=>e[0].sum);
	redisClient.hSet("post:"+id, "votes", p);
	return p;
}

export function toGroup(group: ObjectId | undefined | null){
	if (group) {
		return io.to("group:"+group)
	} else {
		return io
	}
}

export namespace Converter {
	export async function toPostData(post: WithId<DatabaseTypes.Post>): Promise<PostData> {
		return {
			createdAt: post.createdAt.toNumber(),
			updatedAt: post.updatedAt.toNumber(),
			id: post._id.toString(),
			content: post.content,
			author: post.author.toString(),
			group: post.group?.toString(),
			// commentCount: getCommentCount(post),
			votes: await getVotes(post._id)
		}
	}
	export function toGroupDataFull(group: WithId<DatabaseTypes.Group>): GroupData {
		return {
			id: group._id.toString(),
			name: group.name,
			createdAt: group.createdAt.toNumber(),
			updatedAt: group.updatedAt.toNumber(),
			icon: group.icon,
			description: group.description,
			isPublic: group.isPublic,
		}
	}
	export function toGroupDataPartial(group: WithId<DatabaseTypes.Group>): GroupData {
		// todo: implement partial group data
		return toGroupDataFull(group);
	}
			
	export function toUserDataPartial(user: WithId<DatabaseTypes.User>): UserDataPartial {
		return {
			createdAt: user.createdAt.toNumber(),
			id: user._id.toString(),
			username: user.username,
			avatar: user.settings.avatar,
			flags: user.flags as number,
		}
	}
	export function toUserDataFull(user: WithId<DatabaseTypes.User>): UserDataFull {
		return {
			...toUserDataPartial(user),
			money: user.money,
			description: user.settings.description,
			inventory: user.inventory.map(i=>({
				item: i.item.toString(),
				count: i.count,
			}))
		}
	}
	export function toClientInfoData(user: WithId<DatabaseTypes.User>): ClientInfoData {
		return {
			blocked: user.blocked.map(b=>b.toString()),
			groups: user.groups.map(g => g.toString()),
			settings: user.settings,
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
			replyTo: comment.replyTo?.toString(),
		}
	}

	export function toItemData(item: WithId<DatabaseTypes.Item>): ItemData {
		return {
			id: item._id.toString(),
			name: item.name,
			description: item.description,
			icon: item.icon,
			unique: item.unique,
		}
	}
}
