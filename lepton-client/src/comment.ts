import { EventEmitter } from "events";
import { Client, Options, signedIn } from "./client";
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

export class Comment<Opts extends Options> extends EventEmitter {
	id: string;
	content: string;
	author: User<Opts>;
	post: Post<Opts>;
	createdAt: number;
	
	static from<Opts extends Options>(client: Client<Opts>, data: CommentData): Comment<Opts> {
		if (client.commentsCache.has(data.id)){
			return client.commentsCache.get(data.id)!;
		}
		return new Comment(client, data);
	}

	@signedIn()
	async delete(){
		const result = await fetch(`/api/comments/delete`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.client.token}`,
			},
			body: JSON.stringify({
				id: this.id,
			})
		}).then(e=>e.json());
		if (result.error) { 
			throw new Error(result.error);
		}
	}

	constructor(public client: Client<Opts>, data: CommentData){
		super();
		this.id = data.id;
		this.content = data.content;
		this.createdAt = data.createdAt;
		this.author = client.usersCache.get(data.author)!;
		this.post = client.postsCache.get(data.post)!;
		client.commentsCache.set(this.id, this);
	}
}