/**
 * URL: /api/signin
 * Description: Returns a token for the user if the username and password are correct.
 * Method: POST
 * Body: {
 *  username: string,
 *  password: string,
 * }
 */

import { Request, Response } from "express";
import { users } from "../database";
import { Checkables, createGuard, Error, getUserFromAuth } from "./util";

interface Data {}

const blockGuard = createGuard({
	user: Checkables.objectId,
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = blockGuard(req.body);
	if ("error" in result) {
		return res.status(400).json(result.error);
	}

	const user = await getUserFromAuth(req, res);
	if (!user) return;

	users.updateOne(
		{ _id: user._id },
		{ $addToSet: { blocks: result.value.user } }
	);
}
