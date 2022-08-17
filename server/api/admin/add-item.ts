import { Request, Response } from "express";
import { readFileSync } from "fs";
import { ObjectId } from "mongodb";
import { mergeInventory, mergeInventoryAsync } from "server/inventories";
import { DatabaseTypes, posts, users } from "../../database";
import { io, redisClient } from "../../server-entry";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

const lockScript = readFileSync("./scripts/lock-inventory.lua").toString();

interface Data {}

const addItemGuard = createGuard({
	user: Checkables.objectId,
	item: Checkables.objectId,
	count: Checkables.integer,
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = addItemGuard(req.body);
	if ("error" in result) return res.status(400).json(result);

	const user = await getUserFromAuth(req, res);
	if (!user) return;
	if (
		(user.flags & DatabaseTypes.Flags.Owner) |
		(user.flags & DatabaseTypes.Flags.Admin)
	) {
		const target = await users.findOne({
			_id: new ObjectId(result.value.user),
		});
		if (!target) return res.status(400).json({ error: "User not found" });
		const item = await users.findOne({});
		if (!item) return res.status(400).json({ error: "Item not found" });
		while (
			await redisClient.eval(lockScript, {
				arguments: [target._id.toString()],
			})
		) {}

		const newInventory = await mergeInventoryAsync(target.inventory, [
			{
				item: item._id,
				count: result.value.count,
			},
		]);
		await users.updateOne(
			{ _id: target._id },
			{ $set: { inventory: newInventory } }
		);

		await redisClient.hSet(
			target._id.toString(),
			"inventory-lock",
			JSON.stringify(newInventory)
		);
		res.json({});
	} else {
		res.status(403).json({ error: "You are not allowed to do that" });
	}
}
