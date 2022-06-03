import { useSelector, useDispatch } from "react-redux";
import { client } from "../../lib/client";
import { RootState } from "../../lib/store";
import { Post } from "./post";
import InfiniteScroll from "react-infinite-scroll-component";
import { createContext, useEffect, useRef } from "react";
import { onPostsLoadedOld, resetPosts } from "../../lib/store/dataslice";
import { Comments } from "./comments";
import Styles from "./main.module.sass";
export const PostElementsContext = createContext<{
	selected: string | null;
	posts: Record<string, HTMLDivElement>;
}>({ selected: null, posts: {} });

export function Posts() {
	const posts = useSelector((state: RootState) => state.data.posts);
	const dispatch = useDispatch();
	const items = posts.map((id) => (
		<Post key={id} post={client.postsCache.get(id)!} />
	));
	useEffect(() => {
		dispatch(resetPosts());
		async function sub() {
			dispatch(
				onPostsLoadedOld((await client.getPosts()).map((e) => e.id))
			);
		}
		sub();
	}, []);
	return (
		<>
			<div className={Styles.container}>
				<PostElementsContext.Provider value={{ selected: null, posts: {} }}>
					<PostElementsContext.Consumer>
						{(context) => {
							return (
								<>
									<InfiniteScroll
										onScroll={(e) => {
											const target = document.documentElement;
											let v = Object.entries(context.posts).sort((a, b) => a[1].offsetTop-b[1].offsetTop);
											for (const a of v) {
												if (a[1].offsetTop >target.scrollTop) {
													context.selected = a[0];
													break;
												}
											}
										}}
										dataLength={items.length}
										next={async () => {
											if (Object.keys(client.postsCache).length === 0) return;
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
										{items}
									</InfiniteScroll>
									<Comments post={null} />
								</>
							);
						}}
					</PostElementsContext.Consumer>
				</PostElementsContext.Provider>
			</div>
		</>
	);
}
