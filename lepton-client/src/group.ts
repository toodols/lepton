import { Client } from "./client";

export interface GroupData {
	id: string;
	name: string;
}

export class Group {
	id: string;
	name: string;
	/** not in the mood to implement right now. might make it a groupuser instead of a normal user to be able to have roles such as mod and stuff.
	members: User[] = [];
	onMemberAdded(user: User){
		this.members.push(user);
	}
	onMemberRemoved(user: User){
		this.members.splice(this.members.indexOf(user), 1);
	}
	*/
	from(client: Client, from: GroupData){
		if (client.groupsCache.has(from.id)){
			return client.groupsCache.get(from.id)!;
		}
		return new Group(client, from);
	}
	constructor(public client: Client, from: GroupData){
		this.id = from.id;
		this.name = from.name;
		this.client.groupsCache.set(this.id, this);
	}
}