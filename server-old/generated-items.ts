import { Timestamp } from "mongodb";
import { DatabaseTypes, items } from "./database";

export const generatedItems = {
	hatsuneMikuFigurine: {
		name: "Hatsune Miku Figurine",
		description: "A figurine of Hatsune Miku. It's a little bit weird but it's a good figurine.",
		unique: true,
		icon: "",
	}
}

async function createItem(id: string, item: {name: string, description: string, unique: boolean, icon: string}) {
	const result = await items.findOne({
		generatedId: id,
	})
	if (result) {
		//@ts-ignore
		generatedItems[id].id = result._id.toString();
	}
	else {
		const result = await items.insertOne({
			...item,
			//@ts-ignore
			generatedId: id,
			createdAt: Timestamp.fromNumber(Date.now()),
			updatedAt: Timestamp.fromNumber(Date.now()),
		})
		//@ts-ignore
		generatedItems[id].id = result.insertedId.toString();
	}
}

for (const [key, item] of Object.entries(generatedItems)) {
	createItem(key, item);
}