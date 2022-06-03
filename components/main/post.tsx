import { CommentPreview } from "./comment-preview";
import { Post as PostObject } from "lepton-client";
import Styles from "./main.module.sass";
import { useUpdatable } from "../../lib/useUpdatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import Image from "next/image";
import { useContext, useState } from "react";
import {PostElementsContext} from "./posts";
import getConfig from 'next/config'
import { Avatar } from "../util/avatar";

export function Post({ post, setCurrent, current }: { current: string | null, setCurrent: (id: string)=>void, post: PostObject }) {
	useUpdatable(post);
	const userid = useSelector((state: RootState) => state.client.userId)
	const [isBeingDeleted, setIsBeingDeleted] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const ctx = useContext(PostElementsContext);
	return (
		<div ref={(div)=>{
			if (div) {
				ctx.posts[post.id] = div;
			} else {
				delete ctx.posts[post.id];
			}
		}} data-deleting={isBeingDeleted} className={Styles.post}>
			<div className={Styles.post_topbar}>
				<Avatar src={post.author.avatar}/>
				{post.author.username}
				<div className={Styles.action_bar}>
					<button onClick={()=>{
							setCurrent(post.id)
						}}>
							<FontAwesomeIcon icon={faComment}/>
						</button>
					{post.author.id.toString() === userid ? (
						<>
						<button
						className={Styles.deleteButton}
						onClick={() => {
							post.delete();
							setIsBeingDeleted(true);
						}}
						>
							<FontAwesomeIcon icon={faTrash} />
						</button>
							</>
					) : (
						<></>
					)}
				</div>
			</div>
			{post.content}
			{post.lastComment ? (
				<CommentPreview comment={post.lastComment} />
			) : (
				<></>
			)}
		</div>
	);
}
