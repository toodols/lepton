import { useRouter } from "next/router";
import { useRef, useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../../lib/client";
import { RootState, setCreatePostModalOpen } from "../../lib/store";
import Styles from "./create-post-modal.module.sass";
export function CreatePostModal() {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const isOpen = useSelector((state: RootState) => state.main.createPostModalOpen);
	const ref = useRef<HTMLTextAreaElement>(null);
	const router = useRouter();
	const group = router.pathname==="/groups/[groupid]"? String(router.query.groupid) : undefined;

	return <Modal ariaHideApp={false} className={Styles.createPostModal} isOpen={isOpen} closeTimeoutMS={300} onRequestClose={()=>{
		dispatch(setCreatePostModalOpen(false));
	}}>
		<header>Create Post</header>
		<textarea defaultValue="I think I am very sad right now" ref={ref}></textarea>
		<button onClick={()=>{
			client.createPost({
				content: ref.current!.value,
				group
			});
			// dispatch(setCreatePostModalOpen(false));
		}}>Create Post</button>
	</Modal>
}