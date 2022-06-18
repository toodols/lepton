import { Request, Response } from "express";
import { ItemData, UserDataFull } from "lepton-client";
import { ObjectId } from "mongodb";
import { items, users } from "../../database";
import { Converter } from "../../util";
import { Checkables, createGuard, Error } from "../util";

interface Data {
	item: ItemData
}
const lookupItemGuard = createGuard({
	itemid: Checkables.objectId
})

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = lookupItemGuard(req.params as any);
	if ("error" in result) return res.json(result);

	const item = await items.findOne({_id: new ObjectId(result.value.itemid)});
	if (item) {
		res.json({item: Converter.toItemData(item)});
	} else {
		res.status(404).json({error: "Item not found"});
	}
}
