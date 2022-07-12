import { Settings } from "../settings-modal";
import { Sidebar } from "../sidebar";
import { Signin } from "../sign-in-modal";
import { Topbar } from "../topbar";
import { RootState } from "../../lib/store";
import { Component, createContext, PropsWithChildren, ReactElement, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Head from "next/head";
import { client } from "../../lib/client";
import { useRouter } from "next/router";

export const PopupContext = createContext<{
	open: (el: ReactElement, at?: {x: number, y: number}, onHide?: (unmount: ()=>void)=>void)=>void,
}>({
	open: ()=>{},
});
PopupContext.displayName = "PopupContext";

function PopupContextRenderer(){
	const ctx = useContext(PopupContext);
	const [element, setElement] = useState<ReactElement|null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const {current} = useRef<{
		onHide: (unmount: ()=>void)=>void,
	}>({onHide: ()=>{}})

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

	ctx.open = (el,at,_onHide)=>{
		setElement(el);
		if (at){
			setAnchorPoint(at);
		}
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
			<PopupContext.Provider value={{open: ()=>{}}}>
			<PopupContextRenderer/>
			{children}
			</PopupContext.Provider>
			<Signin />
			<Settings />
			<Sidebar />
		</>
	);
}
