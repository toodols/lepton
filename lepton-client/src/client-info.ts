import { Client, DefaultOpts, Options } from "./client";
import { Group } from "./group";
import { Post } from "./post";
import { Settings } from "./types";
import { User, UserDataFull } from "./user";


export interface ClientInfoData {
	groups: string[];
	settings: Settings,
	blocked: string[];
	outgoingFriendRequests: string[];
	incomingFriendRequests: string[];
	following: string[];
}

export interface PostVote {
	post: Post,
	value: 1 | 0 | -1,
}

export interface Interactions {
	postVotes: Record<string,PostVote>	
}

/**
 * Additional information for a user that is only available to the signed in user.
 * This is detached from the user class in order to share data between sign-ins.
 */
export class ClientInfo<Opts extends Options = DefaultOpts> {
	groups: Group<Opts>[]
	outgoingFriendRequestIds: string[]
	incomingFriendRequestIds: string[]
	following: string[];
	interactions: Interactions = {postVotes: {}};

	update(data: ClientInfoData){
		this.groups = data.groups.map((groupId) => this.client.groupsCache.get(groupId)!);
		this.outgoingFriendRequestIds = data.outgoingFriendRequests;
		this.incomingFriendRequestIds = data.incomingFriendRequests;
		this.following = data.following;		
	}

	constructor(public client: Client<Opts>, from: ClientInfoData, /** The user this class is referencing. */ public user: User<Opts>) {
		this.groups = from.groups.map((groupId) => this.client.groupsCache.get(groupId)!);
		this.outgoingFriendRequestIds = from.outgoingFriendRequests;
		this.incomingFriendRequestIds = from.incomingFriendRequests;
		this.following = from.following;
	}
}