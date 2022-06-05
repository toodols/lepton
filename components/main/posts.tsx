import { useSelector, useDispatch } from "react-redux";
import { client } from "../../lib/client";
import { RootState } from "../../lib/store";
import { Post } from "./post";
import InfiniteScroll from "react-infinite-scroll-component";
import { createContext, useEffect, useRef, useState } from "react";
import { onPostsLoadedOld, resetPosts } from "../../lib/store/dataslice";
import { Comments } from "./comments";
import Styles from "./main.module.sass";
export const PostElementsContext = createContext<{
	posts: Record<string, HTMLDivElement>;
}>({ posts: {} });

export function Posts() {
	const posts = useSelector((state: RootState) => state.data.posts);
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(resetPosts());
		async function sub() {
			dispatch(
				onPostsLoadedOld((await client.getPosts()).map((e) => e.id))
			);
		}
		sub();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const [autoCurrentId, setAutoCurrentId] = useState<string | null>(null);
	const [forceCurrentId, setForceCurrentId] = useState<string | null>(null);
	const currentPost = (forceCurrentId &&
		client.postsCache.get(
			forceCurrentId
		)) ||
	(autoCurrentId &&
		client.postsCache.get(
			autoCurrentId
		)) ||
	null
	return (
		<>
			<div className={Styles.container}>
				<PostElementsContext.Provider value={{ posts: {} }}>
					<PostElementsContext.Consumer>
						{(context) => {
							return (
								<>
									<InfiniteScroll
										onScroll={(e) => {
											const target =
												document.documentElement;
											let v = Object.entries(
												context.posts
											).sort(
												(a, b) =>
													a[1].offsetTop -
													b[1].offsetTop
											);
											for (const a of v) {
												if (
													a[1].offsetTop >
													target.scrollTop
												) {
													setAutoCurrentId(a[0]);
													break;
												}
											}
										}}
										dataLength={posts.length}
										next={async () => {
											console.log(client.postsCache.size)
											if (
											
												client.postsCache.size	=== 0
											)
												return;
												console.log("trying to load next");
											dispatch(
												onPostsLoadedOld(
													(
														await client.getPosts({
															before: client.postsCache.get(
																posts[
																	posts.length -
																		1
																]
															)!.createdAt,
														})
													).map((e) => e.id)
												)
											);
										}}
										hasMore={true}
										loader={<div>hmmm</div>}
									>
										{posts.map(id=>(
											<Post key={id} setCurrent={setAutoCurrentId} post={client.postsCache.get(id)!} current={forceCurrentId} />
										))}
									</InfiniteScroll>
									{currentPost?<Comments key={currentPost.id} post={currentPost}/>:<>
									</>}
								</>
							);
						}}
					</PostElementsContext.Consumer>
				</PostElementsContext.Provider>
			</div>
		</>
	);
}
