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
import { Error, getUserFromAuth } from "./util";

interface Data {}

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const user = await getUserFromAuth(req, res);
	if (!user) return;
	
	users.deleteOne({ _id: user._id });
}
