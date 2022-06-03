import { Request, Response } from "express";
import {ClientUserData} from "lepton-client";
import { users } from "../../database";
import { Converter } from "../../util";
import { assertAuthorization } from "../util";

export default async function handler(req: Request, res: Response<ClientUserData>) {
	if (assertAuthorization(req, res)) return;
	const user = await users.findOne({token: req.headers.authorization})
	if (user) {
		// change to Converter.toClientUserData?
		res.status(200).json(Converter.toUserData(user));
	} else {
		res.status(404) // this status might be the wrong one
	}
}
