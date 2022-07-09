import { Settings } from "lepton-client";
import {
	MongoClient,
	Collection,
	Document,
	ObjectId,
	Timestamp,
	Db,
} from "mongodb";
import { MongoDB_URI } from "./env";

export namespace DatabaseTypes {
	interface DatedDocument {
		createdAt: Timestamp;
		updatedAt: Timestamp;
	}

	export enum Permission {
		ALL = 1,
		COMMENT = 2,
		POST = 4,
		GROUP_EVENTS = 8,
	}

	export interface PasswordAuth extends DatedDocument {
		username: string;
		hashed_password: string;
		salt: string;
		user: ObjectId;
		createdAt: Timestamp;
		updatedAt: Timestamp;
		permission: Permission;
	}

	export type Auth = PasswordAuth;

	export const enum Flags {
		None = 0,
		Owner = 1,
		Developer = 2,
		Moderator = 4,
	}
	
	export interface User extends DatedDocument {
		groups: ObjectId[];
		username: string;
		settings: Settings; //may make own type instead of referencing Settings
		inventory: InventoryItem[];
		money: number;
		flags: Flags;
		followers: number;
		following: number;
		friends: ObjectId[];
		blocked: ObjectId[];
	}

	export interface Comment extends DatedDocument {
		content: string;
		author: ObjectId;
		post: ObjectId;
		replyTo?: ObjectId;
	}

	export interface Post extends DatedDocument {
		author: ObjectId;
		content: string;
		group?: ObjectId;
		/** The number of votes will not always be up to date with voters
		 * It is calculated periodically
		 */
		votes: number;
	}

	export interface Group extends DatedDocument {
		name: string;
		isPublic: boolean;
		icon: string;
		description: string;
	}

	export interface GroupUser extends DatedDocument {
		group: ObjectId;
		user: ObjectId;
		isInGroup: boolean;
	}
	export interface Follow {
		user: ObjectId;
		follower: ObjectId;
	}

	export interface Vote {
		post: ObjectId;
		user: ObjectId;
		value: -1 | 0 | 1;
	}

	export interface FriendRequest {
		from: ObjectId;
		to: ObjectId;
		// accepted: boolean;
	}

	export type InventoryItem = {item: ObjectId, count: number, name?: string, description?: string, details?: any};

	export interface Item extends DatedDocument {
		name: string;
		/**
		 * Item is non-stackable
		 */
		unique: boolean;
		icon: string;
		description: string;
	}

	export interface Notification extends DatedDocument {
		user: ObjectId;
		type: string;
		title: string;
		description: string;
		icon: string;
	}

	export interface Poll {
		question: string;
		options: string[];
	}

	export interface Response {
		auth: Collection<Auth>;
		users: Collection<User>;
		posts: Collection<Post>;
		comments: Collection<Comment>;
		groups: Collection<Group>;
		groupUsers: Collection<GroupUser>;
		follows: Collection<Follow>;
		votes: Collection<Vote>;
		friendRequests: Collection<FriendRequest>;
		items: Collection<Item>;
		notifications: Collection<Notification>;
		polls: Collection<Poll>;
		database: Db;
	}
}

export const {
	users,
	posts,
	comments,
	groups,
	groupUsers,
	follows,
	votes,
	database,
	auth,
	items,
	friendRequests,
	notifications,
	polls,
} = await new Promise<DatabaseTypes.Response>((resolve, reject) => {
	const client = new MongoClient(MongoDB_URI);
	client.connect(async (err) => {
		const database = client.db("database");
		const collections: DatabaseTypes.Response = {
			auth: database.collection("auth"),
			groups: database.collection("groups"),
			comments: database.collection("comments"),
			users: database.collection("users"),
			posts: database.collection("posts"),
			follows: database.collection("follows"),
			votes: database.collection("votes"),
			groupUsers: database.collection("groupUsers"),
			friendRequests: database.collection("friendRequests"),
			items: database.collection("items"),
			notifications: database.collection("notifications"),
			polls: database.collection("polls"),
			database,
		};
		// indexes

		// find groupusers by their group and user
		await collections.groupUsers.createIndex(["group", "user"], {
			unique: true,
		});

		// find members of a group
		await collections.groupUsers.createIndex(["group", "isInGroup"]);

		// find posts in any group by newest
		// editing a post should bring it back to the top, which is why updatedAt is used
		await collections.posts.createIndex({ group: 1, updatedAt: -1 });

		// find posts for an author by newest
		await collections.posts.createIndex({ author: 1, createdAt: -1 });

		// find comments for a author by newest
		await collections.comments.createIndex({ author: 1, createdAt: -1 });

		// find comments for a post by newest
		await collections.comments.createIndex({ post: 1, createdAt: -1 });

		// find votes for a post;
		await collections.votes.createIndex({ post: 1 });

		// find user's vote for a post
		await collections.votes.createIndex(["user", "post"], { unique: true });

		// find following for a user
		await collections.follows.createIndex({ follower: 1 });

		// find followers for a user
		await collections.follows.createIndex({ user: 1 });

		// find if user has followed another user
		await collections.follows.createIndex(["user", "follower"], {
			unique: true,
		});

		resolve(collections);
	});
});
