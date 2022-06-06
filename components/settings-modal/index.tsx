import { discardSettings, editSettings, saveSettings, Theme } from "../../lib/store/settings";
import { setSettingsModalOpen } from "../../lib/store";
import Select from "react-select";

import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import Styles from "./settings-modal.module.sass";

function Section(props: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className={Styles.section}>
			<h2>{props.title}</h2>
			{props.children}
		</section>
	);
}

export function Settings() {
	const {settingsModalOpen} = useSelector((state: RootState) => state.main);
	const isEditing = useSelector((state: RootState) => state.settings.isEditing);

	const dispatch = useDispatch();
	return <Modal ariaHideApp={false} className={Styles.settings_modal} closeTimeoutMS={300} onRequestClose={()=>{
		dispatch(discardSettings());
		dispatch(setSettingsModalOpen(false));
	}} isOpen={settingsModalOpen}>
		<h1>Settings</h1>
		<button data-shown={isEditing} className={Styles.save} onClick={()=>{
			dispatch(saveSettings())
		}}>Save</button>
		<Section title="Theme">
			<Select onChange={(value)=>{
				dispatch(editSettings({theme: value!.value as Theme}));
			}} options={[{
				label: "Light",
				value: "light"
			}, {
				label: "Dark",
				value: "dark"
			}, {
				label: "Default",
				value: "default"
			}]}/>
		</Section>

	</Modal>
}