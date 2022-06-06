import { Settings } from 'lepton-client';
import { MongoClient, Collection, Document, ObjectId, Timestamp } from 'mongodb';
import { Permission } from './api/util';
import { MongoDB_URI } from "./env";
export interface PasswordAuth extends Document {
	username: string;
	hashed_password: string;
	salt: string;
	token: string;
	user: ObjectId;
	createdAt: Timestamp;
	updatedAt: Timestamp;
	permission: Permission
}

type Auth = PasswordAuth;

export interface User extends Document {
	username: string;
	settings: Settings, //may make own type instead of referencing Settings
	inventory: ObjectId;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export interface Comment extends Document {
	content: string;
	author: ObjectId;
	post: ObjectId;
	updatedAt: Timestamp;
	createdAt: Timestamp;
}

export interface Post extends Document {
	author: ObjectId;
	content: string;
	updatedAt: Timestamp;
	createdAt: Timestamp;
	group?: ObjectId;
}

export interface Inventory extends Document {
	updatedAt: Timestamp;
	createdAt: Timestamp;
}

export interface Group extends Document {
	name: string;
	isPublic: boolean;
	updatedAt: Timestamp;
	createdAt: Timestamp;
	members: ObjectId[];
}

export interface Response {
	users: Collection<User>;
	posts: Collection<Post>;
	comments: Collection<Comment>;
	auth: Collection<Auth>;
	inventory: Collection<Inventory>;
	groups: Collection<Group>;
}

export const {
	users, posts, comments, auth, inventory
} = await new Promise<Response>((resolve, reject) => {
	const client = new MongoClient(MongoDB_URI);
	client.connect(err => {
		const database = client.db("database");
		resolve({
			groups: database.collection("groups"),
			comments: database.collection("comments"),
			users: database.collection("users"),
			posts: database.collection("posts"),
			auth: database.collection("auth"),
			inventory: database.collection("inventory"),
		})
	});
})