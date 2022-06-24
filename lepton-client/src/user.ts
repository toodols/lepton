import { Client, DefaultOpts, Options, signedIn } from "./client";
import { FOLLOW_USER_URL, FRIEND_USER_URL, UNFOLLOW_USER_URL, UNFRIEND_USER_URL } from "./constants";
import { InventoryItem, Item } from "./item";

export enum Flags {
	None = 0,
	Owner = 1,
	Developer = 2,
	Moderator = 4,
	Tester = 8,
}

export interface UserDataPartial {
	id: string;
	username: string;
	createdAt: number;
	avatar: string;
	flags: Flags;
}

export interface UserDataFull extends UserDataPartial {
	description: string;
	money: number;
	inventory: {
		item: string;
		count: number;
	}[],
	friends: string[];
}
type UserData = UserDataFull | UserDataPartial;
type Maybe<T, Opts extends Options> = Opts["partial"] extends true ? T | undefined : T
function isFull(v: UserData): v is UserDataFull {
	return "description" in v
}

enum Privacy {
	Public = "public",
	Private = "private",
	Followers = "followers",
}

export class User<Opts extends Options = DefaultOpts> {
	flags: Flags;
	
	static from<T extends Options>(client: Client<T>, post: UserData){
		if (client.usersCache.has(post.id)){
			const val = client.usersCache.get(post.id)!;
			val.update(post);
			return val;
		}
		return new User(client, post);
	}

	@signedIn()
	async follow(){
		const result = await fetch(FOLLOW_USER_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.client.token!}`,
			},
		}).then(e=>e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		return result.alreadyFollowed
	}

	@signedIn()
	async friend(){
		const result = await fetch(FRIEND_USER_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.client.token!}`,
			},
			body: JSON.stringify({
				user: this.id,
			}),
		}).then(e=>e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		if (result.accepted) {
			this.client.clientUser!.friendIds!.push(this.id);
		} else {
			this.client.clientInfo!.outgoingFriendRequestIds.push(this.id);
		}
		return result;
	}

	/**
	 * Unfriends a user. Errors if the user is not a friend of the client.
	 */
	@signedIn()
	async unfriend(){
		const result = await fetch(UNFRIEND_USER_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.client.token!}`,
			},
			body: JSON.stringify({
				user: this.id,
			}),
		}).then(e=>e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		return result;
	}

	@signedIn()
	async unfollow(){
		const result = await fetch(UNFOLLOW_USER_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.client.token!}`,
			},
		}).then(e=>e.json());
		if (result.error) {
			throw new Error(result.error);
		}
		return result.alreadyUnfollowed
	}

	update(data: UserData){
		this.username = data.username;		
		this.avatar = data.avatar;
		if (isFull(data)) {
			this.money = data.money;
			this.description = data.description;
		}
	}

	privacy: Privacy = Privacy.Public;
	id: string;
	username: string;
	avatar: string;
	full: Opts["partial"] extends true ? boolean : true;
	inventory?: InventoryItem<Opts>[];
	//@ts-ignore
	description: Maybe<string, Opts>;
	//@ts-ignore
	money: Maybe<number, Opts>;
	friendIds?: string[] = [];
	friends: User<Opts>[] = [];

	constructor(public client: Client<Opts>, from: UserDataFull | UserDataPartial) {
		//@ts-ignore
		this.full = isFull(from);
		this.id = from.id;
		this.username = from.username;		
		this.avatar = from.avatar;
		this.flags = from.flags;
		if (isFull(from)) {
			this.money = from.money;
			this.description = from.description;
			this.inventory = from.inventory.map(i=>new InventoryItem(this.client, i));
			this.friendIds = from.friends;
		}
		this.client.usersCache.set(this.id, this);
	}
}