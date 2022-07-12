import { Client, Options } from "./client";
import { Post } from "./post";
import { User } from "./user";

export interface PollData {
	id: string;
	question: string;
	options: string[];
	// maybe add?
	// can preview responses
	// can change votes
}

export class Poll<Opts extends Options> {
	id: string;
	options: string[];
	question: string;
	author: User<Opts>;
	post: Post<Opts>;

	/** -1 if the client did not submit anything */
	get clientSubmission(): number {
		throw new Error("Not implemented");
	}

	submit(value: number){
		throw new Error("Not implemented");
	}
	
	static from<Opts extends Options>(client: Client<Opts>, poll: PollData, post: Post<Opts>){
		if (client.pollsCache.has(poll.id)){
			const val = client.pollsCache.get(poll.id)!;
			val.update(poll);
			return val;
		}
		return new Poll(client, poll, post);
	}

	constructor(public client: Client<Opts>, poll: PollData, post: Post<Opts>){
		this.post = post;
		this.question = poll.question;
		this.options = poll.options;
		this.id = poll.id;
		this.author = this.post.author;
	}

	update(poll: PollData){
		this.question = poll.question;
		this.options = poll.options;
	}
}