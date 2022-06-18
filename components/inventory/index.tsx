import { client, User, InventoryItem } from "../../lib/client";
import Image from "next/image";
import { useUpdatable } from "lib/useUpdatable";

export function InventoryItemComponent({item}: {item: InventoryItem}) {
	return <div>
		<div>{item.count}</div>
		{/* <Image width={100} height={400} alt={item.item.name} src={item.item.icon}/>
		<div>{item.item.name}</div>
		<div>{item.item.description}</div> */}
	</div>
}
export function Inventory({user}: {user: User}){
	return <div>
		<h1>{user.username}{"'"}s Inventory</h1>
		{user.inventory ? user.inventory.map((item, i) => <InventoryItemComponent key={i} item={item}/>) : <></>}
	</div>
}