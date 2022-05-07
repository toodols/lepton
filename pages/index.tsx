// react dev tools after adding 10 layers of nested elements with react router: 🗿

import type { NextPage } from "next";
import { Signin } from "../components/sign-in-modal";
import { Settings } from "../components/settings-modal";
import { Sidebar } from "../components/sidebar";
import { Topbar } from "../components/topbar";
import { CreatePostModal } from "../components/create-post-modal";
import { Posts } from "../components/main/posts";

const Home: NextPage = () => {
	return (
		<>
				<Posts/>
				<CreatePostModal />
				<Settings />
				<Signin />
		</>
	);
};

export default Home;
