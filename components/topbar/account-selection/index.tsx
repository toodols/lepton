import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../lib/store";
import Styles from "./account-selection.module.sass";
import { Avatar } from "../../util/avatar";
import { useState } from "react";
import { client } from "lib/client";

export function AccountSelection() {
	const clientState = useSelector((state: RootState) => state.client);
	const [isVisible, setIsVisible] = useState(false);

	return <div className={Styles.account_selection}>
		<button className={Styles.button} onClick={()=>{
			setIsVisible(!isVisible);
		}}>
			<Avatar src={clientState.avatar} size={30}/>
			<div>{clientState.username}</div>
		</button>
		<div className={Styles.inner} data-visible={isVisible}>
			<button onClick={()=>{
				client.signOut();
			}}>Sign Out</button>
			<button>Add Account</button>
		</div>
	</div>
}