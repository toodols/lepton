import { Request, Response } from "express";
import { UserDataFull } from "lepton-client";
import { ObjectId } from "mongodb";
import { users } from "../../database";
import { Converter } from "../../util";
import { Checkables, createGuard, Error } from "../util";

interface Data {
	user: UserDataFull
}
const lookupUserGuard = createGuard({
	username: Checkables.string
})

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = lookupUserGuard(req.query as any);
	if ("error" in result) return res.json(result);

	const user = await users.findOne({username: result.value.username});
	if (user) {
		res.json({user: await Converter.toUserDataFull(user)});
	} else {
		res.status(404).json({error: "User not found"});
	}
}
