import { useDispatch } from "react-redux";
import { client } from "../../lib/client";
import { Post } from "./post";
import InfiniteScroll from "react-infinite-scroll-component";
import { createContext, useEffect, useState } from "react";
import { Comments } from "./comments";
import Styles from "./posts.module.sass";
import { GhostPost } from "./ghost-post";
export const PostElementsContext = createContext<{
	posts: Record<string, HTMLDivElement>;
}>({ posts: {} });

export function Posts({groupid}: {groupid?: string}) {
	const [posts, setPosts] = useState<string[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const dispatch = useDispatch();
	useEffect(() => {
		setPosts([]);
		async function sub() {
			const res = await client.getPosts({group: groupid});
			setHasMore(res.hasMore);
			setPosts(res.posts.map(e=>e.id));
		}
		sub();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [groupid]);
	useEffect(()=>{
		const handler = (postid: string)=>{
			setPosts((posts)=>[postid, ...posts]);
		}
		client.on("postAdded", handler)
		const deleteHandler = (postid: string)=>{
			setPosts((posts)=>posts.filter(e=>e!==postid));
		}
		client.on("postDeleted", deleteHandler)
		return ()=>{
			client.removeListener("postAdded", handler)
			client.removeListener("postDeleted", deleteHandler)
		};
	}, [])
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
										className={Styles.postsContainer}
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
											if (
											
												client.postsCache.size	=== 0
											)
												return;
											const query: {before?: number, group?: string} = {};
											if (groupid)
												query.group = groupid;
											let mostRecent = client.postsCache.get(posts[posts.length-1]);
											if (mostRecent) {
												query.before = mostRecent.createdAt;
											}
											const res = await client.getPosts(query);
											setPosts((posts)=>[...posts, ...res.posts.map(e=>e.id)]);
										}}
										hasMore={hasMore}
										loader={<GhostPost/>}
									>
										{posts.map(id=>(
											<Post key={id} setCurrent={setForceCurrentId} post={client.postsCache.get(id)!} current={forceCurrentId} />
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
