import { Client, Options } from "./client";
import { Group } from "./group";
import { Settings } from "./types";
import { User, UserDataFull } from "./user";


export interface ClientInfoData {
	groups: string[];
	settings: Settings,
}

/**
 * Additional information for a user that is only available to the signed in user.
 * This is detached from the user class in order to share data between sign-ins.
 */
export class ClientInfo<Opts extends Options> {
	groups: Group<Opts>[]
	constructor(public client: Client<Opts>, from: ClientInfoData, /** The user this class is referencing. */ public user: User<Opts>) {
		this.groups = from.groups.map((groupId) => this.client.groupsCache.get(groupId)!);
	}
}