import { Settings } from "components/settings-modal";
import { Sidebar } from "components/sidebar";
import { Signin } from "components/sign-in-modal";
import { Topbar } from "components/topbar";
import { RootState } from "lib/store";
import { themes } from "lib/store/settingsmodal";
import { PropsWithChildren } from "react";
import { useSelector } from "react-redux";

// Thank you https://github.com/vercel/next.js/tree/canary/examples/layout-component
export function Layout(props: PropsWithChildren<{}>) {
	const settings = useSelector((state: RootState) => state.settingsModal.settings);

	return <>
		<style suppressHydrationWarning>
		{themes[settings.theme].css}
		</style>
		<Topbar />
		{props.children}
		<Signin />
		<Settings/>
		<Sidebar />
	</>
}