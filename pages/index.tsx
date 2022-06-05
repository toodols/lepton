// react dev tools after adding 10 layers of nested elements with react router: 🗿

import { CreatePostModal } from "../components/create-post-modal";
import { Posts } from "../components/main/posts";
import { ReactNode } from "react";
import { Layout } from "../components/layout";
import { useDispatch } from "react-redux";
import { setTitle } from "lib/store";

export default function Home() {
	const dispatch = useDispatch();
	dispatch(setTitle("Home"));
	return (
		<>
			<Posts/>
			<CreatePostModal />
		</>
	);
};
Home.getLayout = (page: ReactNode)=>(<Layout>{page}</Layout>);