import { client } from "lib/client";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
	RootState,
	setSettingsModalOpen,
	setSidebarOpen,
} from "../../lib/store";
import Styles from "./sidebar.module.sass";

export function Sidebar() {
	const sidebarOpen = useSelector(
		(state: RootState) => state.main.sidebarOpen
	);
	const userid = useSelector((state: RootState) => state.client.userId);
	const dispatch = useDispatch();
	return (
		<>
			<div data-open={sidebarOpen} className={Styles.sidebarContainer}>
				<div
					onClick={() => {
						dispatch(setSidebarOpen(false));
					}}
					className={Styles.sidebarBackdrop}
				></div>
				<aside className={Styles.sidebar}>
					<h1>Lepton</h1>
					<Link href="/" passHref>
						<button
							onClick={() => {
								dispatch(setSidebarOpen(false));
							}}
						>
							Home
						</button>
					</Link>
					{userid ? (
						<>
							<Link href={`/users/${userid}`} passHref>
								<button
									onClick={() => {
										dispatch(setSidebarOpen(false));
									}}
								>
									Profile
								</button>
							</Link>
							<Link href="/inventory" passHref>
								<button
									onClick={() => {
										dispatch(setSidebarOpen(false));
									}}
								>
									Inventory
								</button>
							</Link>
						</>
					) : (
						<>you need sign in to cool stuff</>
					)}

					{/* <Link href="/backrooms" passHref>
						<button
							onClick={() => {
								dispatch(setSidebarOpen(false));
							}}
						>
							Backrooms
						</button>
					</Link> */}
				</aside>
			</div>
		</>
	);
}
