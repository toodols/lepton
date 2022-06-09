import { Layout } from "components/layout";
import { client, Group } from "lib/client";
import { setTitle } from "lib/store";
import { useRouter } from "next/router"
import { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function GroupHandler() {
	const router = useRouter();
	const dispatch = useDispatch();
	const groupid = router.query.groupid;
	console.log(groupid)
	const [group, setGroup] = useState<Group | undefined>(client.groupsCache.get(groupid as string));
	useEffect(()=>{
		if (groupid) {
			client.getGroup(groupid as string).then(setGroup).catch((e)=>{
				console.log("oh no")
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [groupid])
	useEffect(()=>{
		if (group) {
			dispatch(setTitle(group.name));
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [group])
	if (group) {
		return <div>
			Name: {group.name}
			Description: {group.description}
		</div>
	} else {
		return <div>
			Loading...
		</div>
	}
}

GroupHandler.getLayout = (page: ReactNode) => <Layout>{page}</Layout>;