import { CreateGroupModal } from "components/create-group-modal";
import { CreatePostModal } from "components/create-post-modal";
import { Layout } from "components/layout";
import { Posts } from "components/posts";
import { client, Group } from "lib/client";
import { setTitle } from "lib/store";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function GroupHandler() {
	const router = useRouter();
	const dispatch = useDispatch();
	const groupid = router.query.groupid;
	const [group, setGroup] = useState<Group | undefined>(
		client.groupsCache.get(groupid as string)
	);
	const [errored, setErrored] = useState(false);

	useEffect(() => {
		if (groupid) {
			client
				.getGroup(groupid as string)
				.then(setGroup)
				.catch((e) => {
					setErrored(true);
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [groupid]);
	useEffect(() => {
		if (group) {
			dispatch(setTitle(group.name));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [group]);
	if (group) {
		return (
			<>
				<div>
					Name: {group.name}
					<br />
					Description: {group.description}
				</div>
				<Posts groupid={group.id} />
				<CreatePostModal />
				<CreateGroupModal/>
			</>
		);
	} else if (errored) {
		return <div>
			This group does not exist
		</div>;
	} else {
		return <div>Loading...</div>;
	}
}

GroupHandler.getLayout = (page: ReactNode) => <Layout>{page}</Layout>;
