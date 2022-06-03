import { useSelector } from "react-redux";
import { RootState } from "../../../lib/store";
import Styles from "./account-selection.module.sass";
import Image from "next/image";

export function AccountSelection() {
	const avatar = useSelector((state: RootState) => state.client.avatar);
	return <div className={Styles.account_selection}>
		<button className={Styles.inner}>
			<Image width={100} height={100} alt="Avatar" src={"/"+avatar}/>
		</button>
	</div>
}