import { Client, Options } from "./client";
import { User, UserDataFull } from "./user";

export interface ClientUserData extends UserDataFull {
	
}

export class ClientUser<Opts extends Options> extends User<Opts> {
	constructor(client: Client<Opts>, from: ClientUserData) {
		super(client, from);
	}
}