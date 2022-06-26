import { CommentsLoader, Post, PostData } from "./post";
import { User, UserDataFull } from "./user";
import { Comment, CommentData } from "./comment";
import { Group, GroupDataFull } from "./group";
import { EventEmitter } from "events";
import { fetch } from "cross-fetch";
import { io, Socket } from "socket.io-client";
import {
	CREATE_POST_URL,
	GET_COMMENTS_URL,
	GET_POSTS_URL,
	GET_SELF_URL,
	GET_USER_URL,
	SIGN_IN_URL,
	SIGN_UP_URL,
	CREATE_GROUP_URL,
	UPDATE_SETTINGS_URL,
	SEARCH_GROUPS_URL,
	GET_GROUP_URL,
	LOOKUP_ITEM_URL,
} from "./constants";
import { Settings } from "./types";
import { ClientInfo, ClientInfoData } from "./clientinfo";
import { Item, ItemData } from "./item";

// const SOCKET_URL = process.env.NODE_ENV === "development" ? "/api/socket" : "wss://idk lmao";

export interface Options {
	/**
	 * Inspired by discord.js, allows a class to be partial, meaning only containing minimum information.
	 * By default, partial=false, extra parts of the class will always be fetched in order to simply use of the class.
	 */
	partial: boolean;
}

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

	token?: string;
	clientUser?: User<Opts>;
	clientInfo?: ClientInfo<Opts>;
	options: Opts;
	socketio: Socket;

	async getPosts(props?: { before?: number; group?: string, user?: string }) {
		const url = new URLSearchParams();
		if (props) {
			if (props.before) {
				url.set("before", props.before.toString());
			}
			if (props.group) {
				url.set("group", props.group);
			}
			if (props.user) {
				url.set("user", props.user);
			}
		}

		const {
			posts,
			users,
			comments,
			hasMore,
		}: {
			hasMore: boolean;
			posts: PostData[];
			users: UserDataFull[];
			comments: CommentData[];
		} = await fetch(
			GET_POSTS_URL + (url.toString() ? `?${url.toString()}` : "")
		).then((e) => e.json());

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
		}: {
			comments: CommentData[];
			users: UserDataFull[];
			hasMore: boolean;
		} = await fetch(
			GET_COMMENTS_URL +
				`?post=${props.post}` +
				(props.before ? `&before=${props.before}` : "")
		).then((e) => e.json());

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
		this.getItemPromises[props.item] = fetch(
			LOOKUP_ITEM_URL + `${props.item}`
		).then((e) => e.json()).then((e)=>{
			if (e.error) {
				throw new Error(e.error);
			}
			return Item.from(this, e.item);
		});
		return this.getItemPromises[props.item];
	}

	@signedIn()
	async createPost(props: { content: string; group?: string }) {
		const post = await fetch(CREATE_POST_URL, {
			method: "POST",
			body: JSON.stringify(props),
			headers: {
				"content-type": "application/json",
				Authorization: `Bearer ${this.token!}`,
			},
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
		const result = await fetch(GET_SELF_URL, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then((e) => e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		return result;
	}

	async getGroup(groupid: string): Promise<Group<Opts> | undefined> {
		const result = await fetch(`${GET_GROUP_URL}${groupid}`, {
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
		const result = await fetch(
			`${SEARCH_GROUPS_URL}?name=${name}`,
			{}
		).then((e) => e.json());
		if (result.error) {
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
		const result = await fetch(CREATE_GROUP_URL, {
			method: "POST",
			body: JSON.stringify(props),
			headers: {
				"content-type": "application/json",
				Authorization: `Bearer ${this.token!}`,
			},
		}).then((e) => e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		return Group.from(this, result);
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
		const result = await fetch(SIGN_UP_URL, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		}).then((e) => e.json());
		if (result.error) {
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
		const result = await fetch(UPDATE_SETTINGS_URL, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				Authorization: `Bearer ${this.token!}`,
			},
			body: JSON.stringify(settings),
		}).then((e) => e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		return result.settings;
	}

	async getToken(username: string, password: string) {
		const result = await fetch(SIGN_IN_URL, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		}).then((e) => e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		return result.token;
	}

	@signedIn(false)
	async signIn(username: string, password: string) {
		const token = await this.getToken(username, password);
		this.useToken(token);
	}

	async findUser(userid: string): Promise<User<Opts>> {
		const response = await fetch(GET_USER_URL + userid, {
			method: "GET",
			headers: {
				["Content-Type"]: "application/json",
			},
		}).then((e) => e.json());
		if (response.error) {
			throw new Error(response.error);
		}
		return User.from(this, response.user);
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
