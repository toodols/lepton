import { Request, Response } from "express";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";
import {GroupDataPartial} from "lepton-client"
import { groups } from "../../database";
import { Converter } from "../../util";

interface Data {
	groups: GroupDataPartial[]
}

const createGroupGuard = createGuard({
	name: Checkables.string,
})

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = createGroupGuard(req.query as any);
	if ("error" in result) return res.status(400).json({error: result.error});
	const {name} = result.value;
	const fresult = await groups.find({name: {$regex: name, $options: "i"}}).filter({
		isPublic: true,
	}).limit(10).toArray();
	res.json({
		groups: fresult.map(Converter.toGroupDataPartial),
	})
}
