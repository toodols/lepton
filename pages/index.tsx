// react dev tools after adding 10 layers of nested elements with react router: 🗿

import { CreatePostModal } from "../components/create-post-modal";
import { Posts } from "../components/posts";
import { ReactNode, useEffect } from "react";
import { Layout } from "../components/layout";
import { useDispatch } from "react-redux";
import { setTitle } from "lib/store";
import { CreateGroupModal } from "components/create-group-modal";

export default function Home() {
	const dispatch = useDispatch();
	useEffect(()=>{
		dispatch(setTitle("Home"));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return (
		<>
			<Posts/>
			<CreatePostModal />
			<CreateGroupModal/>
		</>
	);
};
Home.getLayout = (page: ReactNode)=>(<Layout>{page}</Layout>);