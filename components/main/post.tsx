import { CommentPreview } from "./comment-preview";
import { Post as PostObject } from "lepton-client";
import { client } from "../../lib/client";
import Styles from "./post.module.sass";
import { useUpdatable } from "../../lib/useUpdatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store";
export function Post({ post }: { post: PostObject }) {
	useUpdatable(post);
	const userid = useSelector((state: RootState) => state.client.userId)
	return (
		<div className={Styles.post}>
			<div className={Styles.postTopbar}>
				{post.author.username}
				{post.author.id.toString() === userid ? (
					<button
						className={Styles.deleteButton}
						onClick={() => {
							post.delete();
						}}
					>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				) : (
					<></>
				)}
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
