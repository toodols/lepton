// react dev tools after adding 10 layers of nested elements with react router: 🗿

import { setTitle } from "store";
import { ReactNode } from "react";
import { useDispatch } from "react-redux";
import { Layout } from "../components/layout";

export default function Backrooms() {
	const dispatch = useDispatch();
	dispatch(setTitle("fjieafjaifjaewoifjawoijfaewiojfa"))
	return (
		<>
			<h1>you{"'"}ve reached the Backrooms</h1>
			<a href="https://static.wikia.nocookie.net/backrooms/images/0/05/Thebackrooms.jpg/revision/latest/scale-to-width-down/640?cb=20190608093553">I don{"'"}t know how copyright works so click here for a link to an image of backrooms</a>			
		</>
	);
};
Backrooms.getLayout = (page: ReactNode)=>(<Layout>{page}</Layout>);