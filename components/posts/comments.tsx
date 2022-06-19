import { faCancel, faComment, faReply, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar } from "../util/avatar";
import { Input } from "../util/input";
import { client, Post, Comment } from "../../lib/client";
import { useUpdatable } from "../../lib/useUpdatable";
import { useEffect, useMemo, useRef, useState } from "react";
import Styles from "./posts.module.sass";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import InfiniteScroll from "react-infinite-scroll-component";

// assuming post will never change
export function Comments({ post }: { post: Post }) {
	const loader = post.commentsLoader;
	useUpdatable(loader);
	const [userid, isSignedIn] = useSelector((state: RootState) => [
		state.client.userId,
		state.client.isSignedIn,
	]);
	const [replyTo, setReplyTo] = useState<Comment | null>(null);

	let last: Comment | undefined;
	const hasMore = loader.hasMore;
	const elements: JSX.Element[] = [];
	for (const comment of [...loader.loaded].reverse()) {
		 elements.push(
			<div className={Styles.box} key={comment.id}>
				{comment.replyTo?<div>Reply to {comment.replyTo.author.username}</div>:<></>}
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
					{isSignedIn?
					<button onClick={()=>{
						setReplyTo(comment);
					}}>
						<FontAwesomeIcon icon={faReply}/>
					</button>:<></>}
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
	}

	const inputRef = useRef<HTMLInputElement>(null);
	// Thank you https://github.com/ankeetmaini/react-infinite-scroll-component/issues/322
	return (
		<div className={Styles.comments}>
			<h2>{post.author.username}</h2>
			<div id="comments" className={Styles.commentsContainer}>
				<InfiniteScroll
					dataLength={elements.length}
					next={() => {
						loader.loadBefore();
					}}
					style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
					inverse={true} //
					hasMore={hasMore}
					loader={<h4>Loading...</h4>}
					scrollableTarget="comments"
				>
					{elements.reverse()}
				</InfiniteScroll>
			</div>
			{replyTo?<div>
				Replying to {replyTo.author.username}
				<button onClick={()=>{
					setReplyTo(null);
				}} className={Styles.cancelReplyButton}>
					<FontAwesomeIcon icon={faCancel}/>
				</button>
			</div>:<></>}
			<Input
				disabled={!isSignedIn}
				name={
					isSignedIn
						? "Enter comment message here"
						: "Sign in to comment"
				}
				ref={inputRef}
				onSubmit={() => {
					if (replyTo) {
						setReplyTo(null);
					}
					post.comment(inputRef.current!.value, replyTo?.id);
					inputRef.current!.value = "";
				}}
			></Input>
		</div>
	);
}
