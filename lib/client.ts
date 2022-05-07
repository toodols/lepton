
import {Client} from "lepton-client";
import { store } from "./store";
import { onClientUserChanged } from "./store/clientslice";
import { onPostAdded, onPostDeleted, onPostsLoadedOld } from "./store/dataslice";

export const client = new Client();
client.on("postDeleted", (id)=>{
	store.dispatch(onPostDeleted(id));
})
client.on("clientUserChanged", () => {
	store.dispatch(onClientUserChanged());
})
client.on("postAdded", (id: string)=>{
	store.dispatch(onPostAdded(id));
})