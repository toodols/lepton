// provides some utility functions for the api just to handle some common error messages, especially authorization and body.

import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { auth, users } from "../database";

export interface Error {
	error: string;
}

export function assertAuthorization(req: Request, res: Response) {
	const auth = req.headers.authorization;
	if (!auth) {
		res.status(401);
		return true;
	}
}

export enum Permission {
	ALL = 1,
	CHAT = 2,
	POST = 4,
}

export async function getUserFromAuth(
	req: Request,
	res: Response,
	permission = Permission.ALL
) {
	const token = req.headers.authorization;
	if (!token) {
		res.status(401);
	}
	const authDoc = await auth.findOne({ token });
	if (!authDoc) return void res.status(400).json({ error: "Invalid token" });
	if (
		!(
			authDoc.permission &&
			(authDoc.permission === Permission.ALL ||
				permission & authDoc.permission)
		)
	)
		return void res.status(403).json({ error: "Insufficient permissions" });
	const user = await users.findOne({ _id: authDoc.user });
	if (!user)
		return void res.status(500).json({ error: "Error finding user" });
	return user;
}

export function assertBody(
	props: Record<string, "string">,
	req: Request,
	res: Response
) {
	for (const prop in props) {
		if (typeof req.body[prop] !== props[prop]) {
			res.status(400);
			res.send({
				error: `Prop "${prop}" is either missing or not of type "${props[prop]}"`,
			});
			return true;
		}
	}
	return false;
}

export function assertQuery(
	props: Record<string, "string">,
	req: Request,
	res: Response
) {
	for (const prop in props) {
		if (typeof req.query[prop] !== props[prop]) {
			res.status(400);
			res.send({
				error: `Prop "${prop}" is either missing or not of type "${props[prop]}"`,
			});
			return true;
		}
	}
	return false;
}
