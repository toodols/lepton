import { Client } from "./client";
import { User, UserData } from "./user";

export interface ClientUserData extends UserData {
	
}

export class ClientUser extends User {
	constructor(client: Client, from: ClientUserData) {
		super(client, from);
	}
}