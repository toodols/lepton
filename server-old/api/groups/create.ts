import { Request, Response } from "express";
import { Timestamp } from "mongodb";
import { groups } from "../../database";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const createGroupGuard = createGuard({
	name: Checkables.string,
	isPublic: Checkables.boolean,
	description: Checkables.string,
})

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = createGroupGuard(req.body);
	if ("error" in result) return res.status(400).json(result);
	const {name, isPublic, description} = result.value;
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const iresult = await groups.insertOne({
		name: name,
		isPublic: isPublic,
		icon: "", // @todo: add icon,
		description: description,
		updatedAt: Timestamp.fromNumber(Date.now()),
		createdAt: Timestamp.fromNumber(Date.now()),
	})
	if (iresult.acknowledged) {
		const data = await groups.findOne({_id: iresult.insertedId});
		res.json({})
		// io.emit("group", {
		// 	group: Converter.toGroupData(data!),
		// }
	} else {
		res.status(500).json({error: "Failed to create group"});
	}
}
