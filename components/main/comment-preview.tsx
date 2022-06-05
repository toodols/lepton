import { Avatar } from "components/util/avatar";
import { useUpdatable } from "lib/useUpdatable";
import {Comment as CommentObject} from "../../lib/client";
import Styles from "./main.module.sass";

export function CommentPreview({comment, select}: {comment: CommentObject, select: ()=>void}) {
	useUpdatable(comment);
	return <button onClick={()=>{
		select()
	}} className={Styles.preview}>
		<Avatar src={comment.author.avatar} size={20} />
		<div className={Styles.author}>{comment.author.username}</div>
		<div>{comment.content}</div>
	</button>
}