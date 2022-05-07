/**
 * URL: /api/signin
 * Description: Returns a token for the user if the username and password are correct.
 * Method: POST
 * Body: {
 *  username: string,
 *  password: string,
 * }
 */

import {Request, Response} from "express";
import { users } from "../database";
import { hash } from "../util";
import {assertBody, Error} from "./util";

interface Data {
	token: string;
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	if (assertBody({username: "string", password: "string"}, req, res)) return;
	const { username, password } = req.body;
	if (req.method !== "POST") res.status(405).end();
	const user = await users.findOne({ username })
	if (user) {
		if (user.hashed_password === hash(password, user.salt)) {
			res.status(200).json({ token: user.token });
		} else {
			res.status(401).json({ error: "Invalid password" })
		}

	} else {
		res.status(400).json({error: "User doesn't exist"}); return;
	}
}
