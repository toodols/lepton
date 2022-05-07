import { EventEmitter } from "events";
import { Client, signedIn } from "./client";
import { Comment } from "./comment";
import { Group } from "./group";
import { User } from "./user";

export interface PostData {
	id: string;
	lastComment?: string;
	author: string;
	content: string;
	group?: string;
}

// keeping track of a post's comments is too expensive
// so there's an optional class that can be used to fetch and listen to new comments
// when it is no longer needed it can be removed
export class CommentsLoader {
	destroy(){
		//
	}
	constructor(public post: Post){
		//
	}
}

export class Post extends EventEmitter {

	static from(client: Client, post: PostData){
		if (client.postsCache.has(post.id)){
			return client.postsCache.get(post.id)!;
		}
		return new Post(client, post);
	}

	id: string;
	content: string;
	lastComment?: Comment;
	author: User;
	group?: Group;

	private commentsLoader?: CommentsLoader;

	getCommentsLoader(){
		if (!this.commentsLoader){
			this.commentsLoader = new CommentsLoader(this);
		}
	}

	@signedIn()
	async delete(){
		const result = await fetch(`/api/posts/delete`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": this.client.token!,
			},
			body: JSON.stringify({
				id: this.id,
			})
		}).then(e=>e.json());
		if (result.error) { 
			throw new Error(result.error);
		}
		// destruction is handled by the client with postDeleted emit
	}

	commentAdded(){
		this.emit("update");
	}

	afterInit(){
		this.lastComment = this.client.commentsCache.get(this.id)!;
	}
	constructor(public client: Client, from: PostData){
		super();
		this.id = from.id;
		this.author = this.client.usersCache.get(from.author)!;
		this.group = from.group ? this.client.groupsCache.get(from.group) : undefined;
		this.content = from.content;
		this.client.postsCache.set(this.id, this);
	}
}
