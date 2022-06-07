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
import { auth, users } from "../database";
import { hash, salt } from "../util";
import { Checkables, createGuard, Error } from "./util";

interface Data {}

const changePasswordGuard = createGuard({
	currentPassword: Checkables.string,
	newPassword: Checkables.string,
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = changePasswordGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });

	const token = req.headers.authorization;
	if (!token) {
		res.status(401);
	}
	const authDoc = await auth.findOne({ token });
	if (!authDoc) return void res.status(400).json({ error: "Invalid token" });

	const { currentPassword, newPassword } = result.value;
	if (hash(currentPassword, authDoc.salt) !== authDoc.hashed_password) {
		return res.status(401).json({ error: "Incorrect password" });
	}

	const password_salt = salt();
	const hashed_password = hash(newPassword, password_salt);
	await auth.updateOne({
		_id: authDoc._id,
	}, {
		$set: {
			salt: password_salt,
			hashed_password,
		},
	})
		
}
