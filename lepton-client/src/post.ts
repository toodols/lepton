import { EventEmitter } from "events";
import { Client, Options, signedIn } from "./client";
import { Comment } from "./comment";
import { CREATE_COMMENT_URL, VOTE_POST_URL } from "./constants";
import { Group } from "./group";
import { User } from "./user";

export interface PostData {
	id: string;
	author: string;
	content: string;
	group?: string;
	// commentCount: number;
	createdAt: number;
	updatedAt: number;
}

// keeping track of a post's comments is too expensive
// so there's an optional class that can be used to fetch and listen to new comments
// when it is no longer needed it can be removed
export class CommentsLoader<Opts extends Options> extends EventEmitter {
	client: Client<Opts>;
	isLoading = false;
	loaded: string[] = [];
	hasMore = true;
	loadUp(){
		
	}
	load(){
		if(this.isLoading) return;
		this.isLoading = true;
		this.client.getComments({post: this.post.id}).then(({comments, hasMore}) => {
			this.isLoading = false;
			this.loaded = comments.map(e=>e.id);
			this.loaded = this.loaded.sort((a,b)=>{
				return this.client.commentsCache.get(a)!.createdAt - this.client.commentsCache.get(b)!.createdAt;
			});
			this.hasMore = hasMore;
			this.emit("update");
		});
	}
	constructor(public post: Post<Opts>, public destroy: ()=>void){
		super();
		this.client = post.client;
		this.load();
		//
	}
}

export class Post<Opts extends Options> extends EventEmitter {

	static from<Opts extends Options>(client: Client<Opts>, post: PostData){
		if (client.postsCache.has(post.id)){
			return client.postsCache.get(post.id)!;
		}
		return new Post(client, post);
	}

	id: string;
	content: string;
	lastComment?: Comment<Opts>;
	author: User<Opts>;
	group?: Group<Opts>;
	createdAt: number;

	private _commentsLoader?: CommentsLoader<Opts>;

	get commentsLoader(): CommentsLoader<Opts> {
		if (!this._commentsLoader){
			this._commentsLoader = new CommentsLoader(this, ()=>{
				this._commentsLoader = undefined;
			});
		}
		return this._commentsLoader;
	}

	@signedIn()
	async vote(value: 1 | 0 | -1){
		const result = await fetch(VOTE_POST_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.client.token!}`,
			},
			body: JSON.stringify({
				post: this.id,
				value,
			})
		}).then(e=>e.json());
		if (result.error) {
			throw new Error(result.error);
		}
	}

	onNewComment(id: string){
		const comment = this.client.commentsCache.get(id)!;
		this._commentsLoader?.loaded.push(id);
		this._commentsLoader?.emit("update");
		this.lastComment = comment;
		this.emit("update");
	}

	@signedIn()
	async comment(content: string){
		const result = await fetch(CREATE_COMMENT_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.client.token!}`,
			},
			body: JSON.stringify({
				post: this.id,
				content: content,
			}),
		}).then(e=>e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		return Comment.from(this.client, result);
	}

	@signedIn()
	async delete(){
		const result = await fetch(`/api/posts/delete`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.client.token!}`,
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

	// afterInit(){
	// 	this.lastComment = this.client.commentsCache.get(this.id)!;
	// }
	constructor(public client: Client<Opts>, from: PostData){
		super();
		this.id = from.id;
		this.author = this.client.usersCache.get(from.author)!;
		this.group = from.group ? this.client.groupsCache.get(from.group) : undefined;
		this.content = from.content;
		this.client.postsCache.set(this.id, this);
		this.createdAt = from.createdAt;
	}
}
