import { Settings } from "../settings-modal";
import { Sidebar } from "../sidebar";
import { Signin } from "../sign-in-modal";
import { Topbar } from "../topbar";
import { RootState } from "lib/store";
import { themes } from "../../lib/store/settings";
import { PropsWithChildren } from "react";
import { useSelector } from "react-redux";

// Thank you https://github.com/vercel/next.js/tree/canary/examples/layout-component
export function Layout({children}: PropsWithChildren<{}>) {
	const settings = useSelector((state: RootState) => state.settingsModal.settings);

	return <>
		<style suppressHydrationWarning>
		{themes[settings.theme].css}
		</style>
		<Topbar/>
		{children}
		<Signin />
		<Settings/>
		<Sidebar />
	</>
}