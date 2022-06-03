import { Post, PostData } from "./post";
import { User, UserData } from "./user";
import { Comment } from "./comment";
import { Group } from "./group";
import { ClientUser } from "./clientuser";
import { EventEmitter } from "events";
import { fetch } from "cross-fetch";
import { io } from "socket.io-client";
import { CREATE_POST_URL, GET_POSTS_URL, GET_SELF_URL, SIGN_IN_URL, SIGN_UP_URL } from "./constants";

const URL = process.env.NODE_ENV === "development" ? "/api/socket" : "wss://idk lmao";

export function signedIn(isSignedIn = true) {
	return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
		const originalMethod = descriptor.value;
		descriptor.value = function (this: Client | { client: Client }, ...args: any[]): any {
			let client: Client;
			if ("client" in this) {
				client = this.client;
			} else {
				client = this;
			}
			if (isSignedIn) {
				if (!client.clientUser) {
					throw new Error("You must be signed in to use this function");
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

export class Client extends EventEmitter {
	commentsCache = new Map<string, Comment>();
	postsCache = new Map<string, Post>();
	usersCache = new Map<string, User>();
	groupsCache = new Map<string, Group>();

	token?: string;
	clientUser?: ClientUser;

	async getPosts(props: { before: number }): Promise<Post[]>;
	async getPosts(): Promise<Post[]>;

	async getPosts(props?: { before: number }) {
		const { posts, users }: { posts: PostData[]; users: UserData[] } = await fetch(
			GET_POSTS_URL + (props?.before ? `?before=${props.before}` : "")
		).then((e) => e.json());

		for (const userid in users) {
			User.from(this, users[userid]);
		}

		let createdPosts = [];
		for (const post of posts) {
			createdPosts.push(Post.from(this, post));
		}
		// after we do comments we do here

		return createdPosts;
	}

	// @TODO add groupid
	@signedIn()
	async createPost(props: { content: string }) {
		const post = await fetch(CREATE_POST_URL, {
			method: "POST",
			body: JSON.stringify(props),
			headers: {
				"content-type": "application/json",
				Authorization: this.token!,
			},
		});
	}

	async useToken(token: string) {
		const result = await fetch(GET_SELF_URL, {
			headers: {
				Authorization: token,
			},
		}).then((e) => e.json());
		this.clientUser = new ClientUser(this, result);
		this.token = token;
		this.emit("clientUserChanged");
	}

	/**
	 * Sign in with username and password
	 */
	@signedIn(false)
	async signUp(username: string, password: string) {
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
		} else {
			this.useToken(result.token);
		}
	}

	@signedIn(false)
	async signIn(username: string, password: string) {
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
		} else {
			this.useToken(result.token);
		}
	}

	constructor() {
		super();
		const socketio = io();
		socketio.on("post", ({ post, author }: { post: PostData; author: UserData }) => {
			console.log(post, author);
			User.from(this, author);

			// there is no need to call afterinit on post because there are no comments
			Post.from(this, post);
			console.log(post);
			this.emit("postAdded", post.id);
		});
		socketio.on("postDeleted", (id) => {
			if (this.postsCache.has(id)) {
				this.emit("postDeleted", id);
				this.postsCache.get(id)!.emit("deleted");
				this.postsCache.delete(id);
			}
		});
	}
}
