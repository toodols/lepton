import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../../lib/client";
import {
	setSignInModalOpen,
	RootState,
	setSidebarOpen,
	setCreatePostModalOpen,
} from "../../lib/store";
import { AccountSelection } from "./account-selection";
import Styles from "./topbar.module.sass";

export function Topbar() {
	const dispatch = useDispatch();
	const { username, isSignedIn } = useSelector(
		(state: RootState) => state.client
	);
	const router = useRouter();

	return (
		<header className={Styles.topbar}>
			<button
				onClick={() => {
					dispatch(setSidebarOpen(true));
				}}
			>
				<FontAwesomeIcon icon={faBars} />
			</button>
			<h2 className={Styles.title}>
				{router.pathname === "/" ? "Home" : router.pathname}
			</h2>
			<div className={Styles.right}>
				{isSignedIn ? (
					<>
						{router.pathname === "/" ? (
							<button
								onClick={() => {
									dispatch(setCreatePostModalOpen(true));
								}}
							>
								Create Post
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
