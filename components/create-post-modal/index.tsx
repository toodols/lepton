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
	return <Modal ariaHideApp={false} className={Styles.create_post_modal} isOpen={isOpen} closeTimeoutMS={300} onRequestClose={()=>{
		dispatch(setCreatePostModalOpen(false));
	}}>
		<h1>Create Post</h1>
		<textarea defaultValue="I think I am very sad right now" ref={ref}></textarea>
		<button onClick={()=>{
			client.createPost({
				content: ref.current!.value
			});
			// dispatch(setCreatePostModalOpen(false));
		}}>Create Post</button>
	</Modal>
}