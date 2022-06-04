import { Avatar } from "components/util/avatar";
import { Comment, CommentsLoader, Post } from "lepton-client";
import { client } from "lib/client";
import { useUpdatable } from "lib/useUpdatable";
import { useEffect, useMemo, useRef, useState } from "react";
import Styles from "./main.module.sass";

// assuming post will never change
export function Comments({ post }: { post: Post }) {
	const loader = post.commentsLoader;
	useUpdatable(loader)

	let last: Comment | undefined;
	const elements = loader.loaded.map((commentid)=>{
		const comment = client.commentsCache.get(commentid)!;

		const res = <div key={comment.id}>
				{comment.author!==last?.author?<div className={Styles.author}>
					<Avatar size={30} src={comment.author.avatar}/>
					<div>{comment.author.username}</div>
				</div>:<></>}
				<div className={Styles.content}>{comment.content}</div>
			</div>;
		last = comment;
		return res;
	})
	const inputRef = useRef<HTMLInputElement>(null);
	if (post && loader) {
		return <div className={Styles.comments}>
			<div>{post.author.username}</div>
			<div>{post.id}</div>
			<div className={Styles.comments_container}>
				{elements}
			</div>
			<input placeholder="Enter comment message here" ref={inputRef} onKeyDown={(event)=>{
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
