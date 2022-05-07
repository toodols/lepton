import {Request, Response} from "express";
import { users } from "../database";
import { hash, salt, token } from "../util";
import {assertBody, Error} from "./util";

interface Data {
	token: string;
}

export default async function handler(req: Request, res: Response<Error | Data>) {
	if (assertBody({username: "string", password: "string"}, req, res)) return;
	
	const { username, password } = req.body;
	const user = await users.findOne({ username })
	if (user) {res.status(400).json({error: "User already exists!"}); return}
	const password_salt = salt();
	const hashed_password = hash(password, password_salt);
	
	const generatedToken = token();
	users.insertOne({
		username,
		hashed_password,
		salt: password_salt,
		token: generatedToken,
	})

	res.status(200).json({token: generatedToken});

}
