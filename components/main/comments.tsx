import { Comment, CommentsLoader, Post } from "lepton-client";
import { useUpdatable } from "lib/useUpdatable";
import { useEffect, useRef, useState } from "react";
import Styles from "./main.module.sass";
export function Comments({ post }: { post: Post | null }) {
	const [loader, setLoader] = useState<CommentsLoader | null>(null)
	const [comments, setComments] = useState<Comment[]>([])
	useEffect(()=>{
		if (post) {
			setLoader((prev)=>{
				prev?.destroy();
				if (post.commentsLoader) {
					post.commentsLoader.on("update", ()=>{
						setComments(post.commentsLoader.loaded)
					})
				}
				return post.commentsLoader;
			});
		}
	}, [post])

	const inputRef = useRef<HTMLInputElement>(null);

	if (post && loader) {
		return <div className={Styles.comments}>
			<div>{post.author.username}</div>
			<div>{post.id}</div>
			{loader.loaded.map(comment=>{
				return <div key={comment.id}>{comment.content}</div>
			})}
			<input placeholder="Enter chat message here" ref={inputRef} onKeyDown={(event)=>{
				if (event.key === "Enter") {
					post.comment(inputRef.current!.value);
					inputRef.current!.value = "";
				}
			}}></input>
		</div>
	} else {
		return <div className={Styles.comments}>
			Loading ... 
		</div>
	}
}
