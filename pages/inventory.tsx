// react dev tools after adding 10 layers of nested elements with react router: 🗿

import { CreatePostModal } from "../components/create-post-modal";
import { Posts } from "../components/posts";
import { ReactNode, useEffect } from "react";
import { Layout } from "../components/layout";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setTitle } from "store";
import { CreateGroupModal } from "components/create-group-modal";
import { client } from "lib/client";
import { Inventory } from "components/inventory";
export default function InventoryPage() {
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(setTitle("Inventory"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const isSignedIn = useSelector(
		(state: RootState) => state.client.isSignedIn
	);
	if (isSignedIn) {
		return <Inventory user={client.clientUser!} />;
	} else {
		return <></>;
	}
}
InventoryPage.getLayout = (page: ReactNode) => <Layout>{page}</Layout>;
