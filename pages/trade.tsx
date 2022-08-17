// react dev tools after adding 10 layers of nested elements with react router: 🗿

import { CreatePostModal } from "../components/create-post-modal";
import { Posts } from "../components/posts";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Layout } from "../components/layout";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setTitle } from "lib/store";
import { CreateGroupModal } from "components/create-group-modal";
import { client, User } from "../lib/client";
import { Inventory } from "components/inventory";
export default function InventoryPage() {
	const dispatch = useDispatch();
	const [tradeWith, setTradeWith] = useState<User>();
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		dispatch(setTitle("Trade"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const isSignedIn = useSelector(
		(state: RootState) => state.client.isSignedIn
	);
	if (isSignedIn) {
		if (tradeWith) {
			return <div>
				<div>Trading with {tradeWith.username}</div>
			</div>
		} else {
		return <div>
			<label>Put the user you want to trade with.</label>
			<input ref={inputRef}/>
			<button onClick={async ()=>{
				const u = await client.getUserByUsername(inputRef.current!.value)
				if (!u) {
					// user not found oh no
					return;
				}
				setTradeWith(u);
			}}>OK</button>
		</div>

		}
	} else {
		return <></>;
	}
}
InventoryPage.getLayout = (page: ReactNode) => <Layout>{page}</Layout>;
