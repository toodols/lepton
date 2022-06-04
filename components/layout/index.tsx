import { Settings } from "components/settings-modal";
import { Sidebar } from "components/sidebar";
import { Signin } from "components/sign-in-modal";
import { Topbar } from "components/topbar";
import { PropsWithChildren } from "react";

// Thank you https://github.com/vercel/next.js/tree/canary/examples/layout-component
export function Layout(props: PropsWithChildren<{}>) {
	return <>
		<Topbar />
		{props.children}
		<Signin />
		<Settings/>
		<Sidebar />
	</>
}