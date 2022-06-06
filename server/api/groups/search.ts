import { Request, Response } from "express";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";
import {GroupDataPartial} from "lepton-client"

interface Data {
	groups: GroupDataPartial[]
}

const createGroupGuard = createGuard({
	query: Checkables.string,
})

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = createGroupGuard(req.body);
	if ("error" in result) return res.status(400).json({error: result.error});

	//todo
}
