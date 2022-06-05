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
import { auth, users } from "../database";
import { hash } from "../util";
import {assertBody, Error} from "./util";

interface Data {
	token: string;
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	if (assertBody({username: "string", password: "string"}, req, res)) return;
	const { username, password } = req.body;
	if (req.method !== "POST") res.status(405).end();
	const authDoc = await auth.findOne({ username })
	if (authDoc) {
		return res.json({token: authDoc.token});
	} else {
		res.status(400).json({error: "User doesn't exist"}); return;
	}
}
