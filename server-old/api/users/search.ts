import { Request, Response } from "express";
import { UserDataPartial } from "lepton-client";
import { ObjectId } from "mongodb";
import { users } from "../../database";
import { Converter } from "../../util";
import { Checkables, createGuard, Error } from "../util";

interface Data {
	users: UserDataPartial[];
}
const searchUserGuard = createGuard({
	query: Checkables.string
})

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = searchUserGuard(req.params as any);
	if ("error" in result) return res.json(result);

	// search username with query
	const query = result.value.query;
	const results = await users.find({
		username: {
			$regex: `^${query}`,
			$options: "i"
		}
	}).limit(10).toArray();
	res.send({
		users: results.map(Converter.toUserDataPartial),
	});
}
