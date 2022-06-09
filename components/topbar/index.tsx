import { faBars, faGear, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../../lib/client";
import {
	setSignInModalOpen,
	RootState,
	setSidebarOpen,
	setCreatePostModalOpen,
	setTitle,
	setSettingsModalOpen,
} from "../../lib/store";
import { AccountSelection } from "./account-selection";
import { GroupSelection } from "./group-selection";
import Styles from "./topbar.module.sass";

export function Topbar() {
	const dispatch = useDispatch();
	const { username, isSignedIn } = useSelector(
		(state: RootState) => state.client
	);
	const title = useSelector((state: RootState) => state.main.title);
	const router = useRouter();
	return (
		<header className={Styles.topbar}>
			<button
				onClick={() => {
					dispatch(setSidebarOpen(true));
				}}
				className={Styles.menu_button}
			>
				<FontAwesomeIcon icon={faBars} />
			</button>
			<h2 className={Styles.title}>
				{title}
			</h2>
			{(router.pathname==="/" || router.pathname === "/groups/[groupid]")?(<GroupSelection/>):<></>}
			<div className={Styles.right}>
				<button onClick={()=>{
						dispatch(setSidebarOpen(false));
						dispatch(setSettingsModalOpen(true))
					}}>
						<FontAwesomeIcon icon={faGear}/>
					</button>
				{isSignedIn ? (
					<>
						{(router.pathname==="/" || router.pathname === "/groups/[groupid]")? (
							<button
								onClick={() => {
									dispatch(setCreatePostModalOpen(true));
								}}
							>
								<FontAwesomeIcon icon={faPlus} />
							</button>
						) : (
							<></>
						)}
						<AccountSelection />
					</>
				) : (
					<button
						onClick={() => {
							dispatch(setSignInModalOpen(true));
						}}
					>
						Sign In
					</button>
				)}
			</div>
		</header>
	);
}
