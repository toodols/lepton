import { Client, Options } from "./client";
import { Group } from "./group";
import { User, UserDataFull } from "./user";

export interface ClientInfoData {
	groups: string[];
}

/**
 * Information for client thing
 */
export class ClientInfo<Opts extends Options> {
	groups: Group<Opts>[]
	constructor(public client: Client<Opts>, from: ClientInfoData, /** The user this class is referencing. */ public user: User<Opts>) {
		this.groups = from.groups.map((groupId) => this.client.groupsCache.get(groupId)!);
	}
}