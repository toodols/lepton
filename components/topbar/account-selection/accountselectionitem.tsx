import { faClose, faSignOut, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar } from "../../util/avatar";
import { client } from "lib/client";
import { removeAccount } from "lib/store/clientslice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Styles from "./account-selection.module.sass";
export function AccountSelectionItem({ token, onClick }: { onClick:()=>void, token: string }) {
	const [info, setInfo] = useState<{
		username: string;
		avatar: string;
	} | null>(null);
	const dispatch = useDispatch();
	useEffect(() => {
		client.getSelfInfo(token).then((info)=>{
			setInfo(info.user);
		}).catch(error=>{
			console.log(error);
			dispatch(removeAccount(token));
		});
	}, [token, dispatch]);
	return (
		<div className={Styles.account_selection_item}>
			<button
				onClick={() => {
					client.useToken(token);
					onClick();
				}}
			>
				{info ? (
					<>
						<Avatar className={Styles.image} src={info.avatar} size={20} />
						{info.username}
					</>
				) : (
					<div className={Styles.img_container}>
						Loading ...
					</div>
				)}
			</button>
			<button onClick={()=>{
				dispatch(removeAccount(token));
			}} className={Styles.remove}><FontAwesomeIcon icon={faSignOut}/></button>
		</div>
	);
}
