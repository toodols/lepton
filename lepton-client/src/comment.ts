import { EventEmitter } from "events";
import { Client, DefaultOpts, Options, signedIn } from "./client";
import type { Post } from "./post";
import type { User } from "./user";
import { delete_ } from "./methods/delete";

export interface CommentData {
	id: string;
	content: string;
	author: string;
	post: string;
	createdAt: number;
	updatedAt: number;
	replyTo?: string;
}

export interface Comment<Opts> {
	on(event: "deleted", listener: () => void): this;
}

export class Comment<Opts extends Options = DefaultOpts> extends EventEmitter {
	id: string;
	content: string;
	author: User<Opts>;
	post: Post<Opts>;
	createdAt: number;
	replyTo?: Comment<Opts>;

	static waitForId<Opts extends Options>(id: string, callback: (obj: Comment<Opts>) => void){
		this.awaitingIds.push({id, callback});
	}
	static awaitingIds: {id: string, callback: (obj: Comment<any>) => void}[] = [];
	
	static from<Opts extends Options>(client: Client<Opts>, data: CommentData): Comment<Opts> {
		if (client.commentsCache.has(data.id)){
			return client.commentsCache.get(data.id)!;
		}
		const generated = new Comment(client, data);
		Comment.awaitingIds.filter(({id}) => id === data.id).forEach(({callback}) => {
			callback(generated);
		})
		Comment.awaitingIds = Comment.awaitingIds.filter(({id}) => id !== data.id);
		return generated;
	}

	@signedIn()
	async reply(content: string){
		this.post.comment(content, this.id);
	}

	@signedIn()
	async delete(){
		const result = await delete_(`/api/comments/${this.id}`, {token: this.client.token!});
		if ("error" in result) { 
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
		if (data.replyTo) {
			this.replyTo = client.commentsCache.get(data.replyTo);
			if (!this.replyTo) {
				Comment.waitForId(data.replyTo, (obj: Comment<Opts>) => {
					this.replyTo = obj;
				});
			}
		}
		client.commentsCache.set(this.id, this);
	}
}