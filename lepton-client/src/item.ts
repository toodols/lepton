import { Client, DefaultOpts, Options } from "./client"

export interface ItemData {
	id: string;
	name: string;
	description: string;
	unique: boolean;
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
	async loadType(): Promise<Item<Opts>> {
		if (this.item) {
			return this.item;
		}
		return this.client.getItem({item: this.itemId}).then(item => {
			this.item = item;
			return item;
		});
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

	static from<Opts extends Options>(client: Client<Opts>, data: ItemData): Item<Opts> {
		if (client.itemsCache.has(data.id)) {
			return client.itemsCache.get(data.id)!;
		}
		return new Item(client, data);
	}
	constructor(public client: Client<Opts>, public data: ItemData){
		this.name = data.name;
		this.description = data.description;
		this.unique = data.unique;
		this.icon = data.icon;
		client.itemsCache.set(data.id, this);
	}
}