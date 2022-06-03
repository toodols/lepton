import { MongoClient, Collection, Document, ObjectId, Timestamp } from 'mongodb';
import { MongoDB_URI } from "./env";

export interface User extends Document {
	username: string;
	hashed_password: string;
	salt: string;
	token: string;
	avatar: string;
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
	lastComment?: ObjectId;
	updatedAt: Timestamp;
	createdAt: Timestamp;
	group?: ObjectId;
}

export interface Response {
	users: Collection<User>;
	posts: Collection<Post>;
	comments: Collection<Comment>;
}

export const {
	users, posts, comments
} = await new Promise<Response>((resolve, reject) => {
	const client = new MongoClient(MongoDB_URI);
	client.connect(err => {
		const database = client.db("database");
		
		resolve({
			comments: database.collection("comments"),
			users: database.collection("users"),
			posts: database.collection("posts"),
		})
	});
})