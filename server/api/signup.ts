import {Request, Response} from "express";
import { users } from "../database";
import { hash, salt, token } from "../util";
import {assertBody, Error} from "./util";

interface Data {
	token: string;
}

function verifyPassword(password: string): void | string {
	if (password.length > 32) {
		return "Password should not be longer than 32 characters";
	}
	if (password.length < 8) {
		return "Password should be longer than 8 characters";
	}
	// 16 is more secure so other checks can be ignored
	if (password.length > 16) {
		// ok
	} else {
		if (password.match(/[0-9]/g) === null) {
			return "Password should contain at least one number";
		}
		if (password.match(/[a-z]/g) === null) {
			return "Password should contain at least one lowercase letter";
		}
		if (password.match(/[A-Z]/g) === null) {
			return "Password should contain at least one uppercase letter";
		}
		if (password.match(/[^a-zA-Z0-9]/g) === null) {
			return "Password should contain at least one special character";
		}
	}

}

export default async function handler(req: Request, res: Response<Error | Data>) {
	if (assertBody({username: "string", password: "string"}, req, res)) return;
	
	const { username, password } = req.body;
	const msg = verifyPassword(password); if (msg) {return res.status(400).json({error: msg});}

	const user = await users.findOne({ username })
	if (user) {res.status(400).json({error: "User already exists!"}); return}
	const password_salt = salt();
	const hashed_password = hash(password, password_salt);
	
	const generatedToken = token();
	users.insertOne({
		createdAt: Date.now(),
		username,
		hashed_password,
		salt: password_salt,
		token: generatedToken,
		avatar: "/avatar.png",
	})

	res.status(200).json({token: generatedToken});

}
