import { Client, DefaultOpts, Options } from "./client"

export interface ItemData {
	id: string;
	name: string;
	description: string;
	unique: true;
	icon: string;
}

type InventoryItemData = {
	item: string,
	count: number,
	details?: any;
	name?: string;
	description?: string;
}

export class InventoryItem<Opts extends Options = DefaultOpts> {
	count: number;
	item?: Item<Opts>;
	private itemId: string;
	load(){
		this.client.getItem({item: this.itemId});
	}
	constructor(public client: Client<Opts>, public data: InventoryItemData) {
		this.count = data.count;
		this.item = this.client.itemsCache.get(data.item);
		this.itemId = data.item;
	}
}


export class Item<Opts extends Options = DefaultOpts, Details=any> {
	name: string;
	description: string;
	icon: string;
	unique: boolean;
	constructor(public client: Client<Opts>, public data: ItemData){
		this.name = data.name;
		this.description = data.description;
		this.unique = data.unique;
		this.icon = data.icon;
	}
}