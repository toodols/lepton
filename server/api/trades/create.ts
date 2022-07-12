import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { DatabaseTypes, trades, users } from "../../database";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {
	trade: string;
}

/*
	interface TradeReq {
		target: ObjectId,
		itemsOffered: {item: ObjectId, count: number}[],
		itemsRequested: {item: ObjectId, count: number}[],
	}
*/

const arrayOfItems = (e: any)=>{
	if (typeof e !== "object") return {error: "Not an object"};
	const itemId = Checkables.objectId(e.item);
	if ("error" in itemId) return itemId;
	const count = Checkables.integer(e.count);
	if ("error" in count) return count;
	if (count.value <= 0) return {error: "Count must be greater than 0"};

	return {
		value: {
			item: itemId.value,
			count: count.value
		}
	}	
}

const sendTradeGuard = createGuard({
	target: Checkables.objectId,
	itemsOffered: Checkables.array(arrayOfItems),
	itemsRequested: Checkables.array(arrayOfItems)
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = sendTradeGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const {target, itemsOffered, itemsRequested} = result.value;

	// make sure target is not the same as user
	if (target.equals(user._id)) return res.status(400).json({ error: "You cannot trade with yourself" });

	const targetUser = users.findOne({_id: target});

	// having same ids on both sides is probably wrong but we don't care
	const itemIdMap: Record<string, ObjectId> = {};
	for (const item of itemsOffered) {
		itemIdMap[item.item.toString()] = item.item;
	}
	for (const item of itemsRequested) {
		itemIdMap[item.item.toString()] = item.item;
	}

	const itemIds: ObjectId[] = [];
	for (const itemString in itemIdMap) {
		const itemId = itemIdMap[itemString];
		itemIds.push(itemId);
	}

	// make sure all itemIds exist
	const items = await users.find({_id: {$in: itemIds}}).toArray();
	if (items.length !== itemIds.length) {
		return res.status(400).json({ error: "One or more items do not exist" });
	}

	// ok now send trade
	const trade = {
		from: user._id,
		to: target,
		itemsOffered: itemsOffered,
		itemsRequested: itemsRequested,
		status: DatabaseTypes.TradeStatus.Pending,
	};
	
	const iResult = await trades.insertOne(trade);
	if (!iResult.insertedId) return res.status(500).json({ error: "Failed to create trade" });

	return res.json({
		trade: iResult.insertedId.toString()
	});
}
