import { faComment, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar } from "../util/avatar";
import { Input } from "../util/input";
import { client, Post, Comment } from "lib/client";
import { useUpdatable } from "../../lib/useUpdatable";
import { useEffect, useMemo, useRef, useState } from "react";
import Styles from "./main.module.sass";
import { useSelector } from "react-redux";
import { RootState } from "lib/store";

// assuming post will never change
export function Comments({ post }: { post: Post }) {
	const loader = post.commentsLoader;
	useUpdatable(loader);
	const userid = useSelector((state: RootState) => state.client.userId);

	let last: Comment | undefined;
	const elements = loader.loaded.map((commentid) => {
		const comment = client.commentsCache.get(commentid)!;
		const res = (
			<div className={Styles.box} key={comment.id}>
				{comment.author !== last?.author ? (
					<div className={Styles.author}>
						<Avatar size={30} src={comment.author.avatar} />
						<div>{comment.author.username}</div>
					</div>
				) : (
					<></>
				)}
				<div className={Styles.content}>{comment.content}</div>
				<div className={Styles.actions}>
					{comment.author.id === userid ? (
						<button
							onClick={() => {
								comment.delete();
							}}
						>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					) : (
						<></>
					)}
				</div>
			</div>
		);
		last = comment;
		return res;
	});
	const inputRef = useRef<HTMLInputElement>(null);
	if (post && loader) {
		return (
			<div className={Styles.comments}>
				<h2>{post.author.username}</h2>

				<div className={Styles.comments_container}>{elements}</div>
				<Input
					name="Enter comment message here"
					ref={inputRef}
					onSubmit={()=>{
						post.comment(inputRef.current!.value);
						inputRef.current!.value = "";
					}}
				></Input>
			</div>
		);
	} else {
		return <div className={Styles.comments}>Loading ...</div>;
	}
}
