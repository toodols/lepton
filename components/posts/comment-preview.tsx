import { Avatar } from "components/util/avatar";
import { useUpdatable } from "../../lib/useUpdatable";
import {Comment as CommentObject} from "../../lib/client";
import Styles from "./posts.module.sass";

export function CommentPreview({comment, select, update}: {comment: CommentObject, select: ()=>void, update: ()=>void}) {
	useUpdatable(comment);
	comment.on("deleted", ()=>{
		update()
	})
	return <button onClick={()=>{
		select()
	}} className={Styles.preview}>
		<Avatar src={comment.author.avatar} size={20} />
		<div className={Styles.author}>{comment.author.username}</div>
		<span>{comment.content}</span>
	</button>
}