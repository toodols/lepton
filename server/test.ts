import { ObjectId, Timestamp, WithId } from "mongodb";
import { DatabaseTypes } from "./database";
import { mergeInventory } from "./inventories";
import { hex } from "./util";

let itemTypes = {
	[hex(24)]: {
		name: "Grapes",
	},
	[hex(24)]: {
		name: "Apples",
	},
	[hex(24)]: {
		name: "Oranges",
		unique: true,
	},
} as unknown as Record<string, WithId<DatabaseTypes.Item>>;

let keys = Object.keys(itemTypes);

const result = mergeInventory([
	{ item: new ObjectId(keys[0]), count: 1 },
	{ item: new ObjectId(keys[2]), count: 1 },
], [
	{ item: new ObjectId(keys[0]), count: 2 },
	{ item: new ObjectId(keys[0]), count: 2 },
	{ item: new ObjectId(keys[1]), count: 1 },
	{ item: new ObjectId(keys[2]), count: 1, name: "Suborange" },
	{ item: new ObjectId(keys[2]), count: 1, name: "Superorange" },
], itemTypes);

console.log(result);