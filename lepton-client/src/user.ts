import { Client, DefaultOpts, Options, signedIn } from "./client";
import { InventoryItem, InventoryItemData, Item } from "./item";
import { post } from "./methods/post";

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
	inventory: InventoryItemData[];
	banner: string;
	followingCount: number;
	followerCount: number;
	friends: string[];
}
type UserData = UserDataFull | UserDataPartial;
type Maybe<T, Opts extends Options> = Opts["partial"] extends true
	? T | undefined
	: T;
function isFull(v: UserData): v is UserDataFull {
	return "description" in v;
}

enum Privacy {
	Public = "public",
	Private = "private",
	Followers = "followers",
}

export class User<Opts extends Options = DefaultOpts> {
	static from<T extends Options>(client: Client<T>, post: UserData) {
		if (client.usersCache.has(post.id)) {
			const val = client.usersCache.get(post.id)!;
			val.update(post);
			return val;
		}
		return new User(client, post);
	}

	@signedIn()
	async follow() {
		const result = await post(`/api/users/${this.id}/follow`, null, {token: this.client.token!});
		if ("error" in result) {
			throw new Error(result.error);
		}
		return result.alreadyFollowed;
	}


	@signedIn()
	async unfollow() {
		const result = await post(`/api/users/${this.id}/unfollow`, null, {token: this.client.token!});
		if ("error" in result) {
			throw new Error(result.error);
		}
		return result.alreadyUnfollowed;
	}


	@signedIn()
	async friend() {
		const result = await post(`/api/users/${this.id}/friend`, null, {token: this.client.token!});
		if ("error" in result) {
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
	async unfriend() {
		const result = await post(`/api/users/${this.id}/unfriend`, null, {
			token: this.client.token!,
		});
		if ("error" in result) {
			throw new Error(result.error);
		}
		this.client.clientUser?.friendIds?.splice(
			this.client.clientUser.friendIds.indexOf(this.id),
			1
		);
	}

	update(data: UserData) {
		this.username = data.username;
		this.avatar = data.avatar;
		this.id = data.id;
		this.username = data.username;
		this.avatar = data.avatar;
		this.flags = data.flags;
		if (isFull(data)) {
			this.banner = data.banner;
			this.money = data.money;
			this.description = data.description;
			(this.inventory = data.inventory.map((item) => ({
				item: this.client.itemsCache.get(item.item)!,
				count: item.count,
				description: item.description,
				name: item.name,
				details: item.details,
			}))),
				(this.friendIds = data.friends);
			this.followingCount = data.followingCount;
			this.followerCount = data.followerCount;
		}
	}

	/**
	 * @returns undefined if user does not exist or the users following are unknown
	 */
	get clientIsFollowing(): boolean | undefined {
		throw new Error("Not implemented");
	}

	/**
	 * @returns undefined if user does not exist or the users following are unknown
	 */
	get clientIsFriend(): boolean | undefined {
		if (!this.client.clientUser || !this.client.clientUser.friendIds) {
			return undefined;
		}
		return this.client.clientUser.friendIds.includes(this.id);
	}

	privacy: Privacy = Privacy.Public;
	id: string;
	username: string;
	avatar: string;
	full: Opts["partial"] extends true ? boolean : true;
	inventory?: InventoryItem<Opts>[];
	//@ts-ignore
	banner: Maybe<string, Opts>;
	//@ts-ignore
	description: Maybe<string, Opts>;
	//@ts-ignore
	money: Maybe<number, Opts>;
	friendIds?: string[];
	flags: Flags;
	followerCount?: number;
	followingCount?: number;

	constructor(
		public client: Client<Opts>,
		from: UserDataFull | UserDataPartial
	) {
		//@ts-ignore
		this.full = isFull(from);
		this.id = from.id;
		this.username = from.username;
		this.avatar = from.avatar;
		this.flags = from.flags;
		if (isFull(from)) {
			this.banner = from.banner;
			this.money = from.money;
			this.description = from.description;
			(this.inventory = from.inventory.map((item) => ({
				item: this.client.itemsCache.get(item.item)!,
				count: item.count,
			}))),
				(this.friendIds = from.friends);
			this.followerCount = from.followerCount;
		}
		this.client.usersCache.set(this.id, this);
	}
}
