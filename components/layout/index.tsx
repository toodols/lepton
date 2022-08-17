import { Settings } from "../settings-modal";
import { Sidebar } from "../sidebar";
import { Signin } from "../sign-in-modal";
import { Topbar } from "../topbar";
import { RootState, setCommandPaletteModalOpen } from "../../lib/store";
import { Component, createContext, PropsWithChildren, ReactElement, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import { client } from "../../lib/client";
import { useRouter } from "next/router";
import { CommandPalette } from "components/command-palette";

export const PopupContext = createContext<{
	open: (el: ReactElement | ((hiding: boolean)=>ReactElement), hideTime?: number, at?: {x: number, y: number})=>void,
	close: ()=>void,
}>({
	open: ()=>{},
	close: ()=>{},
});
PopupContext.displayName = "PopupContext";

function PopupContextRenderer(){
	const ctx = useContext(PopupContext);
	const [element, setElement] = useState<ReactElement | ((hiding: boolean)=>ReactElement) |null>(null);

	// Thank you https://blog.logrocket.com/creating-context-menu-react/
	const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
	const [show, setShow] = useState(false);
	const [hideTime, setHideTime] = useState(0);
	const [isHiding, setIsHiding] = useState(false);

	const cb = useCallback(
		(event: MouseEvent) => {
			event.preventDefault();
			setAnchorPoint({ x: event.pageX, y: event.pageY });
			setShow(true);
		},
		[setAnchorPoint, setShow]
	);

	useEffect(() => {
		const handler = ()=>{
			setIsHiding((isHiding)=>{
				if (!isHiding) {
					setTimeout(()=>{
						setShow(false);
						setIsHiding(false);
					}, hideTime)
				}
				return true;
			});
		}
		document.addEventListener("click", handler)
		document.addEventListener("contextmenu", cb);
		return ()=>{
			document.removeEventListener("click", handler);
			document.removeEventListener("contextmenu", cb);
		}
	}, [cb, setShow, setIsHiding, hideTime]);

	useEffect(() => {
		ctx.open = (el, hideTime, at)=>{
			setElement(()=>el);
			setHideTime(hideTime || 0);
			if (at){
				setAnchorPoint(at);
			}
			setShow(true);
		}

		ctx.close = ()=>{
			setIsHiding((isHiding)=>{
				if (!isHiding) {
					setTimeout(()=>{
						setShow(false);
						setIsHiding(false);
					}, hideTime)
				}
				return true;
			});
		}
	}, [ctx, setElement, setAnchorPoint, setIsHiding, hideTime])

	if (show) {
		return (
			<div style={{position: "absolute", zIndex: 999, left: anchorPoint.x, top: anchorPoint.y}}>
				{typeof element === "function" ? element(isHiding) : element}
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
	const dispatch = useDispatch();
	
	useEffect(() => {
		if (typeof document !== "undefined") {
			document.body.setAttribute("data-theme", settings.theme);
			document.addEventListener("keydown", (event)=>{
				const ctrl = event.ctrlKey || event.metaKey;
				if (ctrl && event.shiftKey && event.key === "p") {
					dispatch(setCommandPaletteModalOpen(true))
				}
			});
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
			<CommandPalette/>
			<PopupContext.Provider value={{open: ()=>{}, close: ()=>{}}}>
			<PopupContextRenderer/>
			{children}
			</PopupContext.Provider>
			<Signin />
			<Settings />
			<Sidebar />
		</>
	);
}
