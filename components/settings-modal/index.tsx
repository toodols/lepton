import Modal from "react-modal";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store";

export function Settings() {
	const {isOpen} = useSelector((state: RootState) => state.settingsModal);
	return <Modal isOpen={isOpen}>
		<div>Hello world</div>
	</Modal>
}