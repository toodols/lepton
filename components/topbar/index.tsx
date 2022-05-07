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
import Styles from "./topbar.module.sass";

export function Topbar() {
	const dispatch = useDispatch();
	const { username, isLoggedIn } = useSelector(
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
			{isLoggedIn ? (
				<>
					<label>{username}</label>
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
		</header>
	);
}
