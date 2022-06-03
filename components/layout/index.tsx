import { Sidebar } from "components/sidebar";
import { Topbar } from "components/topbar";
import { PropsWithChildren } from "react";

// Thank you https://github.com/vercel/next.js/tree/canary/examples/layout-component
export function Layout({ children }: PropsWithChildren<{}>) {
	return (
		<>
			<Topbar />
			{children}
			<Sidebar />
		</>
	);
}
