import { CommentsLoader, Post, PostData } from "./post";
import { User, UserDataFull } from "./user";
import { Comment, CommentData } from "./comment";
import { Group, GroupDataFull } from "./group";
import { EventEmitter } from "events";
import { io, Socket } from "socket.io-client";
import { Settings } from "./types";
import { ClientInfo, ClientInfoData } from "./clientinfo";
import { Item, ItemData } from "./item";
import { Poll } from "./poll";
import { get } from "./methods/get";
import { post } from "./methods/post";
import { patch } from "./methods/patch";


// const SOCKET_URL = process.env.NODE_ENV === "development" ? "/api/socket" : "wss://idk lmao";

export interface Options {
	/**
	 * Inspired by discord.js, allows a class to be partial, meaning only containing minimum information.
	 * By default, partial=false, extra parts of the class will always be fetched in order to simply use of the class.
	 */
	partial: boolean;
}

/**
 * Marks a method as requiring the client to be signed in (or not, depending on the parameter) to run. Will ~~panic~~ error before the request is actually sent if not.
 * @example
 * ```ts
 * class Object {
 * 	\@signedIn(true)
 * 	async method() {
 * 		// this method requires the client to be signed in
 * 	}
 * }
 * ```
 * */
export function signedIn(isSignedIn = true) {
	return (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) => {
		const originalMethod = descriptor.value;
		descriptor.value = function (
			this: Client | { client: Client },
			...args: any[]
		): any {
			let client: Client;
			if ("client" in this) {
				client = this.client;
			} else {
				client = this;
			}
			if (isSignedIn) {
				if (!client.clientUser) {
					throw new Error(
						"You must be signed in to use this function"
					);
				}
			} else if (!isSignedIn) {
				if (client.clientUser) {
					throw new Error();
				}
			}
			return originalMethod.apply(this, args);
		};
	};
}

export type DefaultOpts = { partial: false };

export interface Client<Opts> {
	on(event: "postAdded", listener: (post: Post<Opts>) => void): this;
	on(event: "postDeleted", listener: (post: Post<Opts>) => void): this;
	on(event: "commentAdded", listener: (comment: Comment<Opts>) => void): this;
	on(
		event: "commentDeleted",
		listener: (comment: Comment<Opts>) => void
	): this;
	on(event: "clientUserChanged", listener: () => void): this;
}

export class Client<Opts extends Options = DefaultOpts> extends EventEmitter {
	commentsCache = new Map<string, Comment<Opts>>();
	postsCache = new Map<string, Post<Opts>>();
	usersCache = new Map<string, User<Opts>>();
	groupsCache = new Map<string, Group<Opts>>();
	itemsCache = new Map<string, Item<Opts>>();
	pollsCache = new Map<string, Poll<Opts>>();

	token?: string;
	clientUser?: User<Opts>;
	clientInfo?: ClientInfo<Opts>;
	options: Opts;
	socketio: Socket;

	async getPosts(props?: { before?: number; group?: string, user?: string }) {
		const {
			posts,
			users,
			comments,
			hasMore,
		} = await get(
			"/api/posts",
			{
				t: Date.now().toString(),
				...(props?.before && {before: props.before?.toString()}),
				...(props?.group && {group: props.group}),
				...(props?.user && {user: props.user}),
			}
		).then(res=>{
			if ("error" in res) {
				throw new Error(res.error);
			}
			return res;
		});

		for (const userid in users) {
			User.from(this, users[userid]);
		}

		let createdPosts: Post<Opts>[] = [];

		for (const postData of posts) {
			let post = Post.from(this, postData);
			createdPosts.push(post);
		}

		for (const comment of comments) {
			let c = Comment.from(this, comment);
			c.post.lastComment = c;
		}

		return { posts: createdPosts, hasMore };
	}

	async getComments(props: {
		post: string;
		before?: number;
	}): Promise<{ comments: Comment<Opts>[]; hasMore: boolean }> {
		const {
			comments,
			users,
			hasMore,
		} = await get(`/api/posts/${props.post}/comments`, {
			...(props.before && {before: props.before.toString()}),
		})

		for (const userid in users) {
			User.from(this, users[userid]);
		}

		let createdComments = [];
		for (const comment of comments) {
			createdComments.push(Comment.from(this, comment));
		}
		return { comments: createdComments, hasMore };
	}

	getItemPromises: Record<string, Promise<Item<Opts>>> = {};
	async getItem(props: {
		item: string;
	}) {
		if (!!this.getItemPromises[props.item]) {
			return this.getItemPromises[props.item];
		}
		this.getItemPromises[props.item] = get(
			`/api/items/${props.item}`
		).then((res)=>{
			if ("error" in res) {
				throw new Error(res.error);
			}
			return Item.from(this, res.item);
		});
		return this.getItemPromises[props.item];
	}

	@signedIn()
	async createPost(props: { content: string; group?: string }) {
		const post_res = await post("/api/posts", props, {token: this.token!}).then(res=>{
			if ("error" in res) {
				throw new Error(res.error);
			}
			return res;
		});
	}

	async getSelfInfo(
		token: string
	): Promise<{
		user: UserDataFull;
		info: ClientInfoData;
		groups: Record<string, GroupDataFull>;
		items: Record<string, ItemData>
	}> {
		const result = await get("/api/users/@me", {}, {
			token
		});
		if ("error" in result) {
			throw new Error(result.error);
		}
		return result;
	}

	async getGroup(groupid: string): Promise<Group<Opts> | undefined> {
		const result = await fetch(`/api/groups/${groupid}`, {
			headers: {
				Authorization: `Bearer ${this.token!}`,
				"Content-Type": "application/json",
			},
		}).then((e) => e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		return Group.from(this, result.group);
	}

	async searchGroups(name: string): Promise<Group<Opts>[]> {
		const result = await get(
			`/api/groups`,
			{name}
		);
		if ("error" in result) {
			throw new Error(result.error);
		}
		return result.groups.map((group: any) => Group.from(this, group));
	}

	watchingGroups = new Set<string>();
	async setWatchingGroups(groups: string[]) {
		// compare if groups is equal to watchingGroups
		if (
			groups.length === this.watchingGroups.size &&
			groups.every((group) => this.watchingGroups.has(group))
		) {
			return;
		}
		this.watchingGroups = new Set(groups);
		this.updateWatchingGroups();
	}
	async updateWatchingGroups() {
		this.socketio.emit("watchingGroups", Array.from(this.watchingGroups));
	}

	@signedIn()
	async createGroup(props: {
		name: string;
		isPublic: boolean;
		description: string;
	}) {
		const result = await post("/api/groups", props, {
			token: this.token!,
		});
		if ("error" in result) {
			throw new Error(result.error);
		}
		return Group.from(this, result.group);
	}

	async useToken(token: string) {
		const info = await this.getSelfInfo(token);
		for (const groupid in info.groups) {
			Group.from(this, info.groups[groupid]);
		}
		for (const itemid in info.items) {
			Item.from(this, info.items[itemid]);
		}
		this.clientUser = User.from(this, info.user);
		this.clientInfo = new ClientInfo(this, info.info, this.clientUser);
		this.token = token;
		this.emit("clientUserChanged");
	}

	/**
	 * Sign in with username and password
	 * Different then sign in because it is more uncommon so after calling this you need to use client.useToken(token)
	 */
	async signUp(username: string, password: string): Promise<string> {
		const result = await post("/api/sign-up", {
				username,
				password,
		});
		if ("error" in result) {
			throw new Error(result.error);
		}
		return result.token;
	}

	@signedIn(true)
	signOut() {
		this.clientUser = undefined;
		this.token = undefined;
		this.emit("clientUserChanged");
	}

	@signedIn(true)
	async updateSettings(settings: Settings) {
		const result = await patch("/api/settings", settings, {
			token: this.token
		});
		if ("error" in result) {
			throw new Error(result.error);
		}
		return result.settings;
	}

	async getToken(username: string, password: string) {
		const result = await post("/api/sign-in", {
				username,
				password,
		});
		if ("error" in result) {
			throw new Error(result.error);
		}
		return result.token;
	}

	@signedIn(false)
	async signIn(username: string, password: string) {
		const token = await this.getToken(username, password);
		this.useToken(token);
	}

	/**
	 * Looks up a full version of a user, and returns it.
	 */
	async getUser(userid: string): Promise<User<Opts>> {
		const result = await get(`/api/users/${userid}`, {}, {token: this.token});
		if ("error" in result) {
			throw new Error(result.error);
		}
		return User.from(this, result.user);
	}

	/**
	 * Looks up a full version of user by case-insensitive username, and returns it.
	 */
	async getUserByUsername(username: string): Promise<User<Opts>> {
		const result = await get(`/api/get-user-by-username`, {
			username
		});
		if ("error" in result) {
			throw new Error(result.error);
		}
		return User.from(this, result.user);
	}

	constructor(options?: Opts) {
		super();
		// @ts-ignore
		this.options = options || { partial: true };

		const socketio = (this.socketio =
			typeof window === "undefined" ? io("http://localhost:3000") : io());
		socketio.on(
			"post",
			({ post, author }: { post: PostData; author: UserDataFull }) => {
				User.from(this, author);

				// there is no need to call afterinit on post because there are no comments
				const p = Post.from(this, post);
				this.emit("postAdded", p);
			}
		);
		socketio.on(
			"comment",
			({
				comment,
				author,
			}: {
				author: UserDataFull;
				comment: CommentData;
			}) => {
				User.from(this, author);
				const post = this.postsCache.get(comment.post);
				if (post) {
					const c = Comment.from(this, comment);
					post.onNewComment(comment.id);
					this.emit("commentAdded", c);
				}
			}
		);
		socketio.on("postDeleted", (id) => {
			if (this.postsCache.has(id)) {
				this.emit("postDeleted", this.postsCache.get(id));
				this.postsCache.get(id)!.emit("deleted");
				this.postsCache.delete(id);
			}
		});
		socketio.on("votesChanged", (id, change) => {
			if (this.postsCache.has(id)) {
				this.postsCache.get(id)!.votes += change;
				this.postsCache.get(id)!.emit("update");
			}
		})
		socketio.on("commentDeleted", (id) => {
			if (this.commentsCache.has(id)) {
				this.emit("commentDeleted", this.commentsCache.get(id));
				const comment = this.commentsCache.get(id)!;
				const post = comment.post;
				const loader: CommentsLoader<Opts> | undefined =
				//@ts-ignore
					comment.post._commentsLoader;
				if (post.lastComment === comment) {
					post.lastComment = loader
						? loader.loaded.filter((e) => e !== id)[
								loader.loaded.length - 1
						  ]
						: undefined;
				}
				comment.emit("deleted");
				if (loader) {
					loader.loaded = loader.loaded.filter((e) => e.id !== id);
					loader.emit("update");
				}
				this.commentsCache.delete(id);
			}
		});
	}
}
