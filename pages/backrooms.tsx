// react dev tools after adding 10 layers of nested elements with react router: 🗿

import type { NextPage } from "next";
import { Signin } from "../components/sign-in-modal";
import { Settings } from "../components/settings-modal";
import { Sidebar } from "../components/sidebar";
import { Topbar } from "../components/topbar";
import { CreatePostModal } from "../components/create-post-modal";
import { Posts } from "../components/main/posts";
import { ReactNode } from "react";
import { Layout } from "components/layout";

export default function Backrooms() {
	return (
		<>
			<h1>you{"'"}ve reached the Backrooms</h1>
			<a href="https://static.wikia.nocookie.net/backrooms/images/0/05/Thebackrooms.jpg/revision/latest/scale-to-width-down/640?cb=20190608093553">I don{"'"}t know how copyright works so click here for a link to an image of backrooms</a>			
		</>
	);
};
Backrooms.getLayout = (page: ReactNode)=>(<Layout>{page}</Layout>);