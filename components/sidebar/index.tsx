import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setSidebarOpen } from "../../lib/store";
import Styles from "./sidebar.module.sass";

export function Sidebar() {
	const sidebarOpen = useSelector(
		(state: RootState) => state.main.sidebarOpen
	);
	const dispatch = useDispatch();
	// do not like adding data-open to both tags, but I want to keep the two separate
	return (
		<>
			<div data-open={sidebarOpen} className={Styles.sidebar_container}>
				<div
					onClick={() => {
						dispatch(setSidebarOpen(false));
					}}
					className={Styles.sidebar_backdrop}
				></div>
				<aside className={Styles.sidebar}>
					<h1>Something Stupid Here</h1>
					<Link href="/" passHref>
						<button
							onClick={() => {
								dispatch(setSidebarOpen(false));
							}}
						>
							Home
						</button>
					</Link>
					<Link href="/backrooms" passHref>
						<button
							onClick={() => {
								dispatch(setSidebarOpen(false));
							}}
						>
							Backrooms
						</button>
					</Link>
				</aside>
			</div>
		</>
	);
}
