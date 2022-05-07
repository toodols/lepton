import { Client } from "./client";


/**
 * Serialized version of User
 */
export interface UserData {
	id: string;
	username: string;
}



export class User {

	static from(client: Client, post: UserData){
		if (client.usersCache.has(post.id)){
			return client.usersCache.get(post.id)!;
		}
		return new User(client, post);
	}

	id: string;
	username: string;
	// avatar: string;

	constructor(public client: Client, from: UserData) {
		this.id = from.id;
		this.username = from.username;		
		this.client.usersCache.set(this.id, this);
	}
}
