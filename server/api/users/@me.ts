import { Request, Response } from "express";
import {ClientUserData} from "lepton-client";
import { Converter } from "../../util";
import { getUserFromAuth } from "../util";
import { Error } from "../util";

export default async function handler(req: Request, res: Response<ClientUserData | Error>) {	
	const user = await getUserFromAuth(req, res);
	if (!user) return;
	res.json(Converter.toClientUserData(user));
}