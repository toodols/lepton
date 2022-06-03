import { Settings } from "components/settings-modal";
import { Sidebar } from "components/sidebar";
import { Signin } from "components/sign-in-modal";
import { Topbar } from "components/topbar";
import { PropsWithChildren } from "react";

export function WithTopbar(props: PropsWithChildren<{}>) {
	return <>
		<Topbar />
		{props.children}
		<Signin />
		<Settings/>
		<Sidebar />
	</>
}