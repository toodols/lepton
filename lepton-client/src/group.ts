import { Client, Options, signedIn } from "./client";
import { fetch } from "cross-fetch";
import { DELETE_GROUP_URL } from "./constants";
export interface GroupDataPartial {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	icon: string;
}
export interface GroupDataFull extends GroupDataPartial {}

export type GroupData = GroupDataPartial | GroupDataFull;

export class Group<Opts extends Options> {
	id: string;
	name: string;
	icon: string;
	// isPublic: boolean;
	// full: boolean;

	@signedIn()
	async delete() {
		fetch(DELETE_GROUP_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `${this.client.token}`,
			},
			body: JSON.stringify({
				id: this.id,
			}),
		});
	}

	@signedIn()
	async rename(name: string) {
		// @todo
	}

	static from<Opts extends Options>(client: Client<Opts>, from: GroupData): Group<Opts> {
		if (client.groupsCache.has(from.id)) {
			return client.groupsCache.get(from.id)!;
		}
		return new Group(client, from);
	}
	constructor(public client: Client<Opts>, from: GroupData) {
		this.id = from.id;
		this.name = from.name;
		this.client.groupsCache.set(this.id, this);
		this.icon = from.icon;
	}
}
