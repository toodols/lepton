import { useSelector } from "react-redux";
import { RootState } from "../../../lib/store";
import Styles from "./account-selection.module.sass";
import { Avatar } from "../../util/avatar";
import { useState } from "react";

export function AccountSelection() {
	const client = useSelector((state: RootState) => state.client);
	const [isVisible, setIsVisible] = useState(false);

	return <div className={Styles.account_selection}>
		<button className={Styles.button} onClick={()=>{
			setIsVisible(!isVisible);
		}}>
			<Avatar src={client.avatar} size={30}/>
			<div>{client.username}</div>
		</button>
		<div className={Styles.inner} data-visible={isVisible}>
			<button>Add Account</button>
		</div>
	</div>
}