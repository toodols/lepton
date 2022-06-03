import { EventEmitter } from "events";
import type { Client } from "./client";
import type { Post } from "./post";
import type { User } from "./user";

export interface CommentData {
	id: string;
	content: string;
	author: string;
	post: string;
	createdAt: number;
	updatedAt: number;
}

export class Comment extends EventEmitter {
	id: string;
	content: string;
	author: User;
	post: Post;
	
	from(client: Client, data: CommentData){
		if (client.commentsCache.has(data.id)){
			return client.commentsCache.get(data.id)!;
		}
		return new Comment(client, data);
	}
	constructor(public client: Client, data: CommentData){
		super();
		this.id = data.id;
		this.content = data.content;
		this.author = client.usersCache.get(data.author)!;
		this.post = client.postsCache.get(data.post)!;
		client.commentsCache.set(this.id, this);
	}
}