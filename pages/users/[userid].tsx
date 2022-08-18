import { Layout } from "../../components/layout";
import { Posts } from "../../components/posts";
import { client, User } from "lib/client";
import { RootState, setTitle } from "lib/store";
import { useRouter } from "next/router"
import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "../../styles/profile.module.sass";
import Image from "next/image";

export default function ProfileHandler() {
	const router = useRouter();
	const userid = router.query.userid;
	const [user, setUser] = useState<User| null>(null);
	const _ = useSelector((state: RootState) => state.client.userId);
	const dispatch = useDispatch();
	
	useEffect(()=>{
		if (userid) {
			let id = String(userid);
		client.getUser(id).then((user)=>{
				dispatch(setTitle(user.username));
				setUser(user);
			}).catch((e)=>{
				console.log(e)
			});
		}
	}, [dispatch, userid])
	return <div>
		{user ? <div>
			<div className={Styles.bannerContainer}>
				{user.banner?<Image src={user.banner} objectFit="cover" layout="fill" alt="banner"></Image>:<></>}
				<div className={Styles.bannerGradient}></div>
				<div className={Styles.details}>
					<Image src={user.avatar} width={80} height={80} style={{borderRadius: "50%"}} alt="avatar"></Image>
					<div>
						<h1>{user.username}</h1>
						<span>{user.description}</span>
					</div>
				</div>
				<div className={Styles.detailsRight}>
					<button>Follow</button>
				</div>
			</div>
			{client.clientUser?client.clientUser.id===userid?<></>:(client.clientUser.friendIds?.includes(user.id) ? <button onClick={()=>{
				user.unfriend().then(e=>()=>{
					// idk
				});
			}}>Unfriend</button> : <button onClick={()=>{
				user.friend().then(e=>()=>{
					// idk
				});
			}}>Add Friend</button>):null}
			<Posts user={user.id}/>
		</div> : <div>Loading...</div>}
	</div>
}

ProfileHandler.getLayout = (page: ReactNode) => <Layout>{page}</Layout>;