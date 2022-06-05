import { Client, Options } from "./client";

export interface UserDataPartial {
	id: string;
	username: string;
	createdAt: number;
	avatar: string;
}

export interface UserDataFull extends UserDataPartial {
	description: string;
}
type UserData = UserDataFull | UserDataPartial;
type Maybe<T, Opts extends Options> = Opts["partial"] extends true ? T | undefined : T
function isFull(v: UserData): v is UserDataFull {
	return "description" in v
}

export class User<Opts extends Options> {
	
	static from<T extends Options>(client: Client<T>, post: UserData){
		if (client.usersCache.has(post.id)){
			const val = client.usersCache.get(post.id)!;
			val.update(post);
			return val;
		}
		return new User(client, post);
	}

	update(data: UserData){
		this.username = data.username;		
		this.avatar = data.avatar;
		if (isFull(data)) {
			this.description = data.description;
		}
	}

	id: string;
	username: string;
	avatar: string;
	full: Opts["partial"] extends true ? boolean : true;
	//@ts-ignore
	description: Maybe<string, Opts>;

	constructor(public client: Client<Opts>, from: UserDataFull | UserDataPartial) {
		//@ts-ignore
		this.full = isFull(from);
		this.id = from.id;
		this.username = from.username;		
		this.avatar = from.avatar;
		if (isFull(from)) {
			this.description = from.description;
		}
		this.client.usersCache.set(this.id, this);
	}
}