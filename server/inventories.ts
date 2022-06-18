import { ObjectId, WithId } from "mongodb";
import { DatabaseTypes, items } from "./database";

type Item = DatabaseTypes.InventoryItem;

export async function getItemTypes(someItems: Item[]){
	const map: Record<string, Promise<[string, WithId<DatabaseTypes.Item> | null]>> = {};
	for (const item of someItems) {
		if (!map[item.item.toString()]) {
			map[item.item.toString()] = items.findOne({
				_id: item.item,
			}).then(result => [item.item.toString(), result])
		}
	}
	const itemTypes = await Promise.all(Object.values(map));
	return Object.fromEntries(itemTypes);
}

function equals(item: Item, item2: Item){
	return item.item.equals(item2.item) && item.name === item2.name && item.description === item2.description && JSON.stringify(item2.details) === JSON.stringify(item.details);
}

export function mergeInventory(inventory: Item[], itemsToAdd: Item[], types: Record<string, WithId<DatabaseTypes.Item> | null>) {
	inventory = [...inventory];
	for (const item of itemsToAdd) {
		const itemType = types[item.item.toString()];
		if (!itemType) {
			throw new Error(`Item ${item.item} not found`);
		}
		let itemInInventory: Item | undefined;	
		for (const i of inventory) {
			if (equals(i, item)) {
				itemInInventory = i;
				break;
			}
		}
		if (itemInInventory) {
			if (itemType.unique) {
				inventory.push(item);
			} else {
				itemInInventory.count += item.count;
			}
		} else {
			inventory.push(item);
		}
	}
	return inventory;
}

export async function mergeInventoryAsync(inventory: Item[], itemsToAdd: Item[]) {
	const itemTypes = await getItemTypes(inventory);
	return mergeInventory(inventory, itemsToAdd, itemTypes);
}
