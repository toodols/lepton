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
import { jwt_secret } from "../env";
import { auth } from "../database";
import { hash } from "../util";
import {Checkables, createGuard, Error} from "./util";
import jwt from "jsonwebtoken";

interface Data {
	token: string;
};
const signInGuard = createGuard({
	username: Checkables.string,
	password: Checkables.string,
});

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = signInGuard(req.body);
	if ("error" in result) return res.status(400).json({error: result.error});

	const { username, password } = result.value;

	
	const authDoc = await auth.findOne({ username })
	if (authDoc) {
		const password_salt = authDoc.salt;
		const hashed_password = hash(password, password_salt);
		if (hashed_password === authDoc.hashed_password) {
			const token = jwt.sign({user: authDoc.user, permission: authDoc.permission}, jwt_secret);
			return res.json({token});
		} else {
			return res.status(401).json({error: "Incorrect password"});
		}
	} else {
		res.status(400).json({error: "User doesn't exist"}); return;
	}
}
