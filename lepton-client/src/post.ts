import { EventEmitter } from "events";
import { Client, DefaultOpts, Options, signedIn } from "./client";
import { Comment } from "./comment";
import { Group } from "./group";
import { User } from "./user";
import { post } from "./methods/post";
import { delete_ } from "./methods/delete";

export interface PostData {
	id: string;
	author: string;
	content: string;
	group?: string;
	// commentCount: number;
	createdAt: number;
	updatedAt: number;
	votes: number;
	attachments: ({
		type: "image";
		url: string;
	} | {
		type: "poll";
		id: string;
	})[];
}

// keeping track of a post's comments is too expensive
// so there's an optional class that can be used to fetch and listen to new comments
// when it is no longer needed it can be removed
export class CommentsLoader<Opts extends Options = DefaultOpts> extends EventEmitter {
	client: Client<Opts>;
	isLoading = false;
	loaded: Comment<Opts>[] = [];
	hasMore = true;
	loadBefore(){
		if(this.isLoading) return;
		this.isLoading = true;
		console.log(this.loaded.map(e=>e.content))
		this.client.getComments({post: this.post.id, before: this.loaded[this.loaded.length-1].createdAt}).then(({comments, hasMore}) => {
			this.isLoading = false;
			this.loaded = [...this.loaded, ...comments];
			this.loaded = this.loaded.sort((a,b)=>{
				return b.createdAt - a.createdAt;
			});
			this.hasMore = hasMore;
			this.emit("update");
		});
	}
	load(){
		if(this.isLoading) return;
		this.isLoading = true;
		this.client.getComments({post: this.post.id}).then(({comments, hasMore}) => {
			this.isLoading = false;
			this.loaded = comments;
			this.loaded = this.loaded.sort((a,b)=>{
				return b.createdAt - a.createdAt;
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

export interface Post<Opts> {
	on(event: "commentAdded", listener: (comment: Comment<Opts>) => void): this;
}

export class Post<Opts extends Options = DefaultOpts> extends EventEmitter {

	static from<Opts extends Options>(client: Client<Opts>, post: PostData){
		if (client.postsCache.has(post.id)){
			return client.postsCache.get(post.id)!;
		}
		return new Post(client, post);
	}

	id: string;
	content: string;

	/**
	 * Tracks the last comment, not guaranteed to be accurate.
	 * Used in the website to display the last comment.
	 * It is not recommended to be used in bots.
	 */
	lastComment?: Comment<Opts>;
	author: User<Opts>;
	group?: Group<Opts>;
	createdAt: number;
	votes: number;

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
		const result = await post(`/api/posts/${this.id}/vote`, {
			value,
		}, {
			token: this.client.token!,
		});
		
		if ("error" in result) {
			throw new Error(result.error);
		}
	}

	onNewComment(id: string){
		const comment = this.client.commentsCache.get(id)!;
		this._commentsLoader?.loaded.unshift(comment);
		this._commentsLoader?.emit("update");
		this.lastComment = comment;
		this.emit("commentAdded", comment);
		this.emit("update");
	}

	@signedIn()
	/**
	 * @param content Content of the comment
	 * @param replyTo The ID of the comment to reply to. Use comment.reply(content) instead.
	 */
	async comment(content: string, replyTo?: string){
		const result = await post("/api/comments", {
			post: this.id,
			content,
			replyTo,
		}, {
			token: this.client.token!,
		}).then(res=>{
			if ("error" in res){
				throw new Error(res.error);
			}
			return res;
		})

		return Comment.from(this.client, result.comment);
	}

	@signedIn()
	async delete(){
		const result = await delete_(`/api/posts/${this.id}`, {
			token: this.client.token!,
		});
		if (result.error) { 
			throw new Error(result.error);
		}
		// destruction is handled by the client with postDeleted emit
	}

	constructor(public client: Client<Opts>, from: PostData){
		super();
		this.id = from.id;
		this.author = this.client.usersCache.get(from.author)!;
		this.group = from.group ? this.client.groupsCache.get(from.group) : undefined;
		this.content = from.content;
		this.client.postsCache.set(this.id, this);
		this.createdAt = from.createdAt;
		this.votes = from.votes;
	}
}
