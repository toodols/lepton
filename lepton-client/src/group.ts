import { Client, DefaultOpts, Options, signedIn } from "./client";
import { delete_ } from "./methods/delete";
export interface GroupDataPartial {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	description: string;
	isPublic: boolean;
	icon: string;
}
export interface GroupDataFull extends GroupDataPartial {}

export type GroupData = GroupDataPartial | GroupDataFull;

export class Group<Opts extends Options = DefaultOpts> {
	id: string;
	name: string;
	icon: string;
	description: string;
	isPublic: boolean;
	// full: boolean;

	@signedIn()
	async delete() {
		delete_(`/api/groups/${this.id}`, {
			token: this.client.token
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
		this.isPublic = from.isPublic;
		this.description = from.description
	}
}
