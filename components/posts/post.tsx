import { CommentPreview } from "./comment-preview";
import { Post as PostObject, User } from "../../lib/client";
import Styles from "./posts.module.sass";
import { useUpdatable } from "../../lib/useUpdatable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faComment,
	faCopy,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store";
import { useContext, useState } from "react";
import { PostElementsContext } from ".";
import { Avatar } from "../util/avatar";
import { useTruncate } from "../../lib/truncate";
import Link from "next/link";
import { Flags } from "lepton-client";
import { MarkupRendered } from "../../components/markup/rendered";
import { PopupContext } from "../../components/layout";
import { ContextMenu } from "../../components/context-menu";
import { UserPreview } from "components/user-preview";
import ReactDOM from "react-dom";

function Roles({ flags }: { flags: Flags }) {
	if (flags & Flags.Developer)
		return <span className={Styles.role}>Developer</span>;
	if (flags & Flags.Owner) return <span className={Styles.role}>Owner</span>;
	if (flags & Flags.Moderator)
		return <span className={Styles.role}>Moderator</span>;
	return <></>;
}

function UserPreviewButton(props: { user: User }) {
	// const [pos, setPos] = useState<{ x: number, y: number } | null>(null);
	return <>{
		// pos?<UserPreview pos={pos} user={props.user}/>:<></>
	}<button onClick={(event)=>{
		// dispaatch show user preview
		// setPos({
		// 	x: event.clientX,
		// 	y: event.clientY,
		// });
	}}
	className={Styles.userPreviewButton}>
		{props.user.username}
	</button></>
}

export function Post({
	post,
	setCurrent,
	current,
}: {
	current: string | null;
	setCurrent: (id: string) => void;
	post: PostObject;
}) {
	useUpdatable(post);
	const [update, setUpdate] = useState(0);

	let contentRef = useTruncate<HTMLDivElement>();
	const userid = useSelector((state: RootState) => state.client.userId);
	const isSignedIn = useSelector(
		(state: RootState) => state.client.isSignedIn
	);
	const [isBeingDeleted, setIsBeingDeleted] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const ctx = useContext(PostElementsContext);
	const popupContext = useContext(PopupContext);
	
	return (
		<div
			onContextMenu={(event) => {
				popupContext.open(
					(isHiding) => (
						<ContextMenu
							isHiding={isHiding}
							items={[
								[
									//@ts-ignore
									...(event.clickOnProfile
										? [
												{
													text: "Copy Author Id",
													onClick: () => {
														navigator.clipboard.writeText(
															post.author.id
														);
													},
												},
										  ]
										: []),
									{
										text: "Copy Id",
										onClick: () => {
											navigator.clipboard.writeText(
												post.id
											);
										},
									},
									{
										text: "Copy Content",
										onClick: () => {
											navigator.clipboard.writeText(
												post.content
											);
										},
									},
									{
										text: "Delete",
										onClick: () => {
											setIsBeingDeleted(true);
											post.delete();
										},
									},
								],
							]}
						/>
					),
					100
				);
			}}
			ref={(div) => {
				if (div) {
					ctx.posts[post.id] = div;
				} else {
					delete ctx.posts[post.id];
				}
			}}
			data-deleting={isBeingDeleted}
			data-expanded={isExpanded}
			className={Styles.post}
		>
			<div className={Styles.postTopbar}>
				<Avatar src={post.author.avatar} />
				<UserPreviewButton user={post.author}/>
				{/* <Link href={`/users/${post.author.id}`}>
					<a
						onContextMenu={(event) => {
							console.log(event);
							//@ts-ignore
							event.clickOnProfile = true;
						}}
					>
						{post.author.username}
					</a>
				</Link>{" "} */}
				<Roles flags={post.author.flags} />
				<div className={Styles.actionBar}>
					<button
						onClick={() => {
							setCurrent(post.id);
						}}
					>
						<FontAwesomeIcon icon={faComment} />
					</button>
					{isSignedIn ? (
						<>
							<button
								onClick={() => {
									post.vote(1);
								}}
							>
								<FontAwesomeIcon icon={faArrowUp} />
							</button>
							{post.votes}
							<button
								onClick={() => {
									post.vote(-1);
								}}
							>
								<FontAwesomeIcon icon={faArrowDown} />
							</button>
						</>
					) : (
						<></>
					)}
					{post.author.id.toString() === userid ? (
						<>
							<button
								className={Styles.deleteButton}
								onClick={() => {
									if (!isBeingDeleted) {
										setIsBeingDeleted(true);
										post.delete().finally(() => {
											setIsBeingDeleted(false);
										});
									}
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
			<div ref={contentRef} className={Styles.content}>
				<MarkupRendered value={post.content} />
				<div className={Styles.overflowGradient}></div>
			</div>
			<button
				className={Styles.showMore}
				onClick={() => {
					setIsExpanded(!isExpanded);
				}}
			>
				{isExpanded ? "Show Less" : "Show More"}
			</button>
			{post.lastComment ? (
				<CommentPreview
					select={() => {
						setCurrent(post.id);
					}}
					comment={post.lastComment}
					update={() => {
						setUpdate(update + 1);
					}}
				/>
			) : (
				<></>
			)}
		</div>
	);
}
