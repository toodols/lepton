import { MarkupRendered } from "../markup/rendered";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../../lib/client";
import { RootState, setCreatePostModalOpen } from "../../store";
import Styles from "./create-post-modal.module.sass";
export function CreatePostModal() {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const isOpen = useSelector(
		(state: RootState) => state.main.createPostModalOpen
	);
	const ref = useRef<HTMLTextAreaElement>(null);
	const router = useRouter();
	const group =
		router.pathname === "/groups/[groupid]"
			? String(router.query.groupid)
			: undefined;
	const [mode, setMode] = useState<"write" | "preview">("write");
	const [currentValue, setCurrentValue] = useState<string>("I am sad.");
	return (
		<Modal
			ariaHideApp={false}
			className={Styles.createPostModal}
			isOpen={isOpen}
			closeTimeoutMS={300}
			onAfterOpen={() => {
				ref.current?.focus();
			}}
			onRequestClose={() => {
				dispatch(setCreatePostModalOpen(false));
			}}
		>
			<header>Create Post</header>
			<div className={Styles.content}>
				<div className={Styles.buttons}>
					<button
						data-selected={mode === "write"}
						onClick={() => {
							setMode("write");
						}}
					>
						Write
					</button>
					<button
						data-selected={mode === "preview"}
						onClick={() => {
							if (mode !== "preview") {
								setMode("preview");
								setCurrentValue(ref.current!.value);
							}
						}}
					>
						Preview
					</button>
				</div>
				{mode === "write" ? (
					<textarea defaultValue={currentValue} ref={ref}></textarea>
				) : (
					<div className={Styles.preview}>
						<MarkupRendered value={currentValue} />
					</div>
				)}
				<button
					onClick={() => {
						client.createPost({
							content: ref.current?ref.current.value:currentValue,
							group,
						});
						dispatch(setCreatePostModalOpen(false));
					}}
				>
					Create Post
				</button>
			</div>
		</Modal>
	);
}
