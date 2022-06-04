import { useDispatch, useSelector } from "react-redux";
import { RootState, setSignInModalOpen } from "../../../lib/store";
import Styles from "./account-selection.module.sass";
import { Avatar } from "../../util/avatar";
import { useState } from "react";
import { client } from "lib/client";
import { AccountSelectionItem } from "./accountselectionitem";
import { removeAllAccounts } from "lib/store/clientslice";

export function AccountSelection() {
	const clientState = useSelector((state: RootState) => state.client);
	const [isVisible, setIsVisible] = useState(false);

	const dispatch = useDispatch();
	return <div className={Styles.account_selection}>
		<button className={Styles.button} onClick={()=>{
			setIsVisible(!isVisible);
		}}>
			<Avatar src={clientState.avatar} size={30}/>
			<div>{clientState.username}</div>
		</button>
		<div className={Styles.inner} data-visible={isVisible}>
			{clientState.accounts.filter((e)=>e!==client.token).map(e=>{
				return <AccountSelectionItem onClick={()=>{
					setIsVisible(false);
				}} key={e} token={e}/>
			})}
			<button onClick={()=>{
				dispatch(setSignInModalOpen(true));
				setIsVisible(false);
			}}>Add Account</button>
			<button onClick={()=>{
				dispatch(removeAllAccounts());
				client.signOut();
			}}>Sign Out All</button>
		</div>
	</div>
}