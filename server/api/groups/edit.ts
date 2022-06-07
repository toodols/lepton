import { Request, Response } from "express";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";
import {GroupDataPartial} from "lepton-client"

interface Data {
	groups: GroupDataPartial[]
}

const editGroupGuard = createGuard({
	
})

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = editGroupGuard(req.body);
	if ("error" in result) return res.status(400).json({error: result.error});

	//todo
}
