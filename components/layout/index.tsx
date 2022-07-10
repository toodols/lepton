import { Settings } from "../settings-modal";
import { Sidebar } from "../sidebar";
import { Signin } from "../sign-in-modal";
import { Topbar } from "../topbar";
import { RootState } from "../../lib/store";
import { Component, createContext, PropsWithChildren, ReactElement, useCallback, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Head from "next/head";
import { client } from "../../lib/client";
import { useRouter } from "next/router";

export const ContextMenu = createContext<{
	open: (el: ReactElement)=>void,
}>({
	open: ()=>{},
});
ContextMenu.displayName = "ContextMenu";

function ContextMenuRenderer(){
	const ctx = useContext(ContextMenu);
	const [element, setElement] = useState<ReactElement|null>(null);
	const [isOpen, setIsOpen] = useState(false);

	// Thank you https://blog.logrocket.com/creating-context-menu-react/
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [show, setShow] = useState(false);
	const cb = useCallback(
		(event: MouseEvent) => {
			event.preventDefault();
			setAnchorPoint({ x: event.pageX, y: event.pageY });
			setShow(true);
		},
		[setAnchorPoint, setShow]
	);
	useEffect(() => {
		document.addEventListener("click", ()=>{
			setIsOpen(false);
		})
		document.addEventListener("contextmenu", cb);
	}, [cb]);

	ctx.open = (el)=>{
		setElement(el);
		setIsOpen(true);
	}
	if (isOpen) {
		return (
			<div style={{position: "absolute", zIndex: 999, left: anchorPoint.x, top: anchorPoint.y}}>
				{element}
			</div>
		);
	} else {
		return <></>;
	}
}

// Thank you https://github.com/vercel/next.js/tree/canary/examples/layout-component
export function Layout({
	children,
	topbarItems = { left: [], right: [] },
}: PropsWithChildren<{
	topbarItems?: {
		left: React.ReactNode;
		right: React.ReactNode;
	};
}>) {
	const settings = useSelector((state: RootState) => state.settings.settings);
	const title = useSelector((state: RootState) => state.main.title);

	useEffect(() => {
		if (typeof document !== "undefined") {
			document.body.setAttribute("data-theme", settings.theme);
		}
	}, [settings]);

	const router = useRouter();
	if (router.pathname === "/groups/[groupid]" && router.query.groupid) {
		client.setWatchingGroups([router.query.groupid as string]);
	} else {
		client.setWatchingGroups([]);
	}

	return (
		<>
			<Head>
				<title>{title} - Lepton</title>
			</Head>
			
			<noscript>
				<div
					style={{
						position: "fixed",
						fontSize: 50,
						zIndex: 10000,
						width: "100%",
						height: "100%",
						background: "white",
					}}
				>
					Why you disable script daddy?
				</div>
			</noscript>
			<Topbar />
			<ContextMenu.Provider value={{open: ()=>{}}}>
			<ContextMenuRenderer/>
			{children}
			</ContextMenu.Provider>
			<Signin />
			<Settings />
			<Sidebar />
		</>
	);
}
