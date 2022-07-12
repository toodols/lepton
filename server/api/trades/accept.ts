import { Request, Response } from "express";
import { readFileSync } from "fs";
import { ObjectId } from "mongodb";
import { dirname, join } from "path";
import { subtractInventoryAsync } from "server/inventories";
import { DatabaseTypes, items, trades, users } from "../../database";
import { redisClient } from "../../server-entry";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

const lockScript = readFileSync("./scripts/lock-trade.lua").toString();
const unlockScript = readFileSync("./scripts/unlock-trade.lua").toString();

interface Data {}

const acceptTradeGuard = createGuard({
	trade: Checkables.objectId,
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = acceptTradeGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	
	const trade = await trades.findOne({_id: result.value.trade});
	if (!trade) return res.status(400).json({ error: "Trade does not exist" });
	
	const _user = await getUserFromAuth(req, res);
	if (!_user) return;
	
	if (! trade.to.equals(_user._id)) return res.status(400).json({ error: "You are not the recipient of this trade" });

	// await lock
	while(await redisClient.eval(lockScript, {arguments: [result.value.trade.toString(), trade.from.toString(), trade.to.toString()]}) as number == 0) {
		await new Promise(resolve => setTimeout(resolve, 1000));
	};

	// update trade to accepted
	await trades.updateOne({_id: result.value.trade}, {$set: {accepted: true}});
	
	const sender = await users.findOne({_id: trade.from});
	if (!sender) return res.status(400).json({ error: "Sender does not exist" });
	const receiver = await users.findOne({_id: trade.to});
	if (!receiver) return res.status(400).json({ error: "Receiver does not exist" });

	const itemTypeIds = new Set<string>();
	for (const item of trade.itemsOffered) {
		itemTypeIds.add(item.item.toString());
	}
	for (const item of trade.itemsRequested) {
		itemTypeIds.add(item.item.toString());
	}
	const itemTypeList = Array.from(itemTypeIds).map(id => new ObjectId(id));

	const itemTypes = await items.find({_id: {$in: itemTypeList}}).toArray();
	if (itemTypes.length !== itemTypeList.length) return res.status(400).json({ error: "One or more item types do not exist" });

	let newSenderInventory: DatabaseTypes.InventoryItem[] = [];
	try {
		newSenderInventory = await subtractInventoryAsync(sender.inventory, trade.itemsOffered);
	} catch (e: any) {
		return res.status(400).json({ error: e.message });
	}

	let newReceiverInventory: DatabaseTypes.InventoryItem[] = [];
	try {
		newReceiverInventory = await subtractInventoryAsync(receiver.inventory, trade.itemsRequested);
	} catch (e: any) {
		return res.status(400).json({ error: e.message });
	}

	// update inventories
	const u1res = await users.updateOne({_id: sender._id}, {$set: {inventory: newSenderInventory}});
	if (!u1res.modifiedCount) return res.status(400).json({ error: "Failed to update sender inventory" });
	const u2res = await users.updateOne({_id: receiver._id}, {$set: {inventory: newReceiverInventory}});
	if (!u2res.modifiedCount) return res.status(400).json({ error: "Failed to update receiver inventory" });

	// unlock
	await redisClient.eval(unlockScript, {arguments: [result.value.trade.toString()]});

	return res.json({});
}
