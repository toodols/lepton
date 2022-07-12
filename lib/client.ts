import {
	Client,
	Comment as _Comment,
	Post as _Post,
	User as _User,
	Group as _Group,
	Item as _Item,
	Poll as _Poll,
	InventoryItem as _InventoryItem,
} from "lepton-client";
import { store } from "./store";
import { onClientUserChanged } from "./store/clientslice";

export type Options = { partial: true };
export type Comment = _Comment<Options>;
export type Post = _Post<Options>;
export type User = _User<Options>;
export type Group = _Group<Options>;
export type Item = _Item<Options>;
export type Poll = _Poll<Options>;
export type InventoryItem = _InventoryItem<Options>;

export const client = new Client({ partial: true });
if (typeof window !== "undefined") {
	//@ts-ignore
	window.client = client;
}
client.on("clientUserChanged", () => {
	store.dispatch(onClientUserChanged());
});

export async function init() {
	if (
		typeof localStorage !== "undefined" &&
		localStorage.getItem("currentAccount")
	) {
		try {
			const result = await client.useToken(
				localStorage.getItem("currentAccount")!
			);
		} catch (e) {
			localStorage.removeItem("currentAccount");
			localStorage.removeItem("accounts");
		}
	}
}
