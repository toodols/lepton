import { Settings } from "../settings-modal";
import { Sidebar } from "../sidebar";
import { Signin } from "../sign-in-modal";
import { Topbar } from "../topbar";
import { RootState } from "lib/store";
import { PropsWithChildren, useEffect } from "react";
import { useSelector } from "react-redux";

// Thank you https://github.com/vercel/next.js/tree/canary/examples/layout-component
export function Layout({children}: PropsWithChildren<{}>) {
	const settings = useSelector((state: RootState) => state.settings.settings);

	useEffect(()=>{
		if (typeof document !== "undefined") {
			document.body.setAttribute("data-theme", settings.theme);
		}
	}, [settings])

	return <>
		<Topbar/>
		{children}
		<Signin />
		<Settings/>
		<Sidebar />
	</>
}