import { CommentsLoader, Post } from "lepton-client";
import Styles from "./main.module.sass";
export function Comments({ post }: { post: Post | null }) {
	if (post) {
		return <div className={Styles.comments}>
			<div>{post.author.username}</div>
			<div>{post.id}</div>
			<input placeholder="Enter chat message here"></input>
		</div>
	} else {
		return <div className={Styles.comments}>
			Loading??
		</div>
	}
}
