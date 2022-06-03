// react dev tools after adding 10 layers of nested elements with react router: 🗿

import type { NextPage } from "next";
import { Signin } from "../components/sign-in-modal";
import { Settings } from "../components/settings-modal";
import { Sidebar } from "../components/sidebar";
import { Topbar } from "../components/topbar";
import { CreatePostModal } from "../components/create-post-modal";
import { Posts } from "../components/main/posts";
import { WithTopbar } from "components/util/withTopbar";
import { ReactNode } from "react";

export default function Home() {
	return (
		<>
			<Posts/>
			<CreatePostModal />
		</>
	);
};
Home.getLayout = (page: ReactNode)=>(<WithTopbar>{page}</WithTopbar>);