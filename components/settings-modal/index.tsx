import { closeSettings, discardSettings, editSettings, saveSettings } from "lib/store/settingsmodal";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import Styles from "./settings-modal.module.sass";

function Section(props: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className={Styles.section}>
			<h2>{props.title}</h2>
			{props.children}
		</div>
	);
}

export function Settings() {
	const {isOpen} = useSelector((state: RootState) => state.settingsModal);
	const dispatch = useDispatch();
	return <Modal ariaHideApp={false} className={Styles.settings_modal} closeTimeoutMS={300} onRequestClose={()=>{
		dispatch(discardSettings());
		dispatch(closeSettings());
	}} isOpen={isOpen}>
		<h1>Settings</h1>
		<button onClick={()=>{
			dispatch(editSettings({
				theme: "dark"
			}))
		}}>Dark Mode</button>
		<button onClick={()=>{
			dispatch(editSettings({
				theme: "light"
			}))
		}}>Light Mode</button>
		<button onClick={()=>{
			dispatch(saveSettings())
		}}>Save</button>
	</Modal>
}