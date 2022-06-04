// provides some utility functions for the api just to handle some common error messages, especially authorization and body.

import {Request, Response} from "express";

export interface Error {
	error: string;
}

export function assertAuthorization(req: Request, res: Response){
	const auth = req.headers.authorization;
	if (!auth) {
		res.status(401);
		return true;
	}
}

export function assertBody(props: Record<string, "string">, req: Request, res: Response) {
	for (const prop in props) {
		if (typeof req.body[prop] !== props[prop]) {
			res.status(400);
			res.send({error: `Prop "${prop}" is either missing or not of type "${props[prop]}"`});
			return true;
		}
	}
	return false;
}

export function assertQuery(props: Record<string, "string">, req: Request, res: Response) {
	for (const prop in props) {
		if (typeof req.query[prop] !== props[prop]) {
			res.status(400);
			res.send({error: `Prop "${prop}" is either missing or not of type "${props[prop]}"`});
			return true;
		}
	}
	return false;
}
