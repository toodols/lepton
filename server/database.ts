import { Settings } from 'lepton-client';
import { MongoClient, Collection, Document, ObjectId, Timestamp } from 'mongodb';
import { Permission } from './api/util';
import { MongoDB_URI } from "./env";



export namespace DatabaseTypes {
	interface DatedDocument extends Document {
		createdAt: Timestamp;
		updatedAt: Timestamp;
	}
	
	export interface PasswordAuth extends DatedDocument {
		username: string;
		hashed_password: string;
		salt: string;
		token: string;
		user: ObjectId;
		createdAt: Timestamp;
		updatedAt: Timestamp;
		permission: Permission
	}
	export type Auth = PasswordAuth;
	export interface User extends DatedDocument {
		groups: ObjectId[];
		username: string;
		settings: Settings, //may make own type instead of referencing Settings
		inventory: ObjectId;
	}

	export interface Comment extends DatedDocument {
		content: string;
		author: ObjectId;
		post: ObjectId;
	}

	export interface Post extends DatedDocument {
		author: ObjectId;
		content: string;
		group?: ObjectId;
		voters: { [user: string]: 1 | -1 };
		/** The number of votes will not always be up to date with voters
		 * It is calculated periodically
		 */
		votes: number;
	}

	export interface Inventory extends DatedDocument {
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
	}

	export interface Response {
		users: Collection<User>;
		posts: Collection<Post>;
		comments: Collection<Comment>;
		auth: Collection<Auth>;
		inventory: Collection<Inventory>;
		groups: Collection<Group>;
		groupUsers: Collection<GroupUser>;
	}
}

export const {
	users, posts, comments, auth, inventory, groups, groupUsers
} = await new Promise<DatabaseTypes.Response>((resolve, reject) => {
	const client = new MongoClient(MongoDB_URI);
	client.connect(async err => {
		const database = client.db("database");
		const collections: DatabaseTypes.Response = {
			groups: database.collection("groups"),
			comments: database.collection("comments"),
			users: database.collection("users"),
			posts: database.collection("posts"),
			auth: database.collection("auth"),
			inventory: database.collection("inventory"),
			groupUsers: database.collection("groupUsers"),
		};
		// indexes
		
		// find auths by their token
		await collections.auth.createIndex("token", { unique: true });

		// find groupusers by their group and user
		await collections.groupUsers.createIndex(["group", "user"], { unique: true });

		// find posts in any group by newest
		// editing a post should bring it back to the top, which is why updatedAt is used
		await collections.posts.createIndex({group: 1, updatedAt: -1});
		
		// find posts for an author by newest
		await collections.posts.createIndex({author: 1, createdAt: -1});
				
		// find comments for a author by newest
		await collections.comments.createIndex({author: 1, createdAt: -1});
		
		// find comments for a post by newest
		await collections.comments.createIndex({post: 1, createdAt: -1});
		resolve(collections);
	});
})