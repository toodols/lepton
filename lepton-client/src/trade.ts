import { Client, Options } from "./client";
import { InventoryItemData } from "./item";

export interface TradeData {
	id: string;
	from: string;
	to: string;
	itemsOffered: InventoryItemData[];
	itemsRequested: InventoryItemData[];
	accepted: boolean;
}

export class Trade<Opts extends Options> {
	static from<Opts extends Options>(client: Client<Opts>, data: TradeData){
		
	}
}