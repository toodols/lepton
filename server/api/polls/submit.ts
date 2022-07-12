import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { pollResponses, polls } from "../../database";
import { createGuard, Checkables, getUserFromAuth } from "../util";

interface Data {};

const submitGuard = createGuard({
	id: Checkables.objectId,
	option: Checkables.integer,
});

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = submitGuard(req.body);
	if ("error" in result) return res.status(400).json(result);
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const poll = await polls.findOne({_id: new ObjectId(result.value.id)});
	if (!poll) {
		return res.status(400).json({error: "Poll does not exist"});
	}

	// make sure the user has not already voted
	// this functionality may change to allow user to change their votes
	const pollResponse = await pollResponses.findOne({
		poll: poll._id,
		user: user._id,
	})

	if (pollResponse /* and you cannot change responses on posts */) {
		return res.status(400).json({error: "You have already voted on this poll"});
	}

	if (poll.options[result.value.option] == undefined) {
		return res.status(400).json({error: "Option does not exist"});
	}

	const insertRes = await pollResponses.insertOne({
		poll: poll._id,
		user: user._id,
		option: result.value.option,
	});

	if (insertRes.acknowledged) {
		res.status(200).json({});
	} else {
		res.status(500).json({error: "Failed to submit vote"});
	}
}
