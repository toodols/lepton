import { useEffect, useState } from "react";
import { client, User, InventoryItem, Item } from "../../lib/client";
import Styles from "./inventory.module.sass";
import Image from "next/image";

export function InventoryItemComponent({ item }: { item: InventoryItem }) {
	const [itemType, setItemType] = useState<Item | null>(item.item || null);
	useEffect(() => {
		if (!itemType) {
			item.loadType().then(setItemType);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={Styles.item}>
			{itemType ? (
				<>
				<div style={{position: "relative", width: 100, height: 100}}>
					<Image src={itemType.icon} layout="fill" alt={"Icon"} />
				</div>
					<div className={Styles.name}>{itemType.name}</div>
				</>
			) : (
				<></>
			)}
			<div className={Styles.count}>{item.count}</div>

			{/* <Image width={100} height={400} alt={item.item.name} src={item.item.icon}/>
		<div>{item.item.name}</div>
		<div>{item.item.description}</div> */}
		</div>
	);
}
export function Inventory({ user }: { user: User }) {
	return (
		<div className={Styles.inventory}>
			<h1>
				{user.username}
				{"'"}s Inventory
			</h1>
			<div className={Styles.container}>
				{user.inventory ? user.inventory.length===0 ? <div>
					<b>Empty.</b>
					<div>You are as broke in Lepton as you are in real life.</div>
				</div> : (
					user.inventory.map((item, i) => (
						<InventoryItemComponent key={i} item={item} />
					))
				) : (
					<>Loading...</>
				)}
			</div>
		</div>
	);
}
