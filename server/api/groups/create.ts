import { Request, Response } from "express";
import { ObjectId, Timestamp } from "mongodb";
import { auth, comments, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const createGroupGuard = createGuard({
	name: Checkables.string,
	isPublic: Checkables.boolean
})

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = createGroupGuard(req.body);
	if ("error" in result) return res.status(400).json({error: result.error});
	
	const user = await getUserFromAuth(req, res);
	if (!user) return;


	//todo
}
