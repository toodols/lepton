import { Layout } from "components/layout";
import { client, User } from "lib/client";
import { setTitle } from "lib/store";
import { useRouter } from "next/router"
import { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function ProfileHandler() {
	const router = useRouter();
	const userid = router.query.userid;
	const [user, setUser] = useState<User| null>(null);
	const dispatch = useDispatch();
	
	useEffect(()=>{
		if (userid) {
			let id = String(userid);
		client.findUser(id).then((user)=>{
				dispatch(setTitle(user.username));
				setUser(user);
			}).catch((e)=>{
				console.log(e)
			});
		}
	})
	return <div>
		{user ? <div>
			<h1>{user.username}</h1>
			<p>{user.description}</p>
		</div> : <div>Loading...</div>}
	</div>
}

ProfileHandler.getLayout = (page: ReactNode) => <Layout>{page}</Layout>;