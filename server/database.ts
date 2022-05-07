import { MongoClient, Collection, Document, ObjectId } from 'mongodb';
import { MongoDB_URI } from "./env";

export interface User extends Document {
	username: string;
	hashed_password: string;
	salt: string;
	token: string;
}

export interface Comment extends Document {
	content: string;
	author: ObjectId;
	post: ObjectId;
}

export interface Post extends Document {
	author: ObjectId;
	content: string;
	lastComment?: ObjectId;
	group?: ObjectId;
}

export interface Response {
	users: Collection<User>;
	posts: Collection<Post>;
}

export const {
	users, posts,
} = await new Promise<Response>((resolve, reject) => {
	const client = new MongoClient(MongoDB_URI);
	client.connect(err => {
		const database = client.db("database");
		
		resolve({
			users: database.collection("users"),
			posts: database.collection("posts"),
		})
	});
})