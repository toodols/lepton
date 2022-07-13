import { useDispatch } from "react-redux";
import { client, Post as PostObj } from "../../lib/client";
import { Post } from "./post";
import InfiniteScroll from "react-infinite-scroll-component";
import { createContext, useEffect, useState } from "react";
import { Comments } from "./comments";
import Styles from "./posts.module.sass";
import { GhostPost } from "./ghost-post";
export const PostElementsContext = createContext<{
	posts: Record<string, HTMLDivElement>;
}>({ posts: {} });

export function Posts({group, user}: {group?: string, user?: string}) {
	const [posts, setPosts] = useState<PostObj[]>([]);
	const [hasMore, setHasMore] = useState(true);

	// don't like autoCurrentId, might remove
	const [autoCurrentId, setAutoCurrentId] = useState<string | null>(null);
	const [forceCurrentId, setForceCurrentId] = useState<string | null>(null);

	if (autoCurrentId && !posts.find((p) => p.id === autoCurrentId)) {
		setAutoCurrentId(null);
	}
	if (forceCurrentId && !posts.find((p) => p.id === forceCurrentId)) {
		setForceCurrentId(null);
	}

	const currentPost = (forceCurrentId &&
		client.postsCache.get(
			forceCurrentId
		)) ||
	(autoCurrentId &&
		client.postsCache.get(
			autoCurrentId
		)) ||
	null
	useEffect(() => {
		setPosts([]);
		async function sub() {
			const res = await client.getPosts({group, user});
			setHasMore(res.hasMore);
			setPosts(res.posts);
		}
		sub();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [group, user]);
	useEffect(()=>{
		const handler = (post: PostObj)=>{
			if (!user || post.author.id === user) {
				setPosts((posts)=>[post, ...posts]);
			}
		}
		client.on("postAdded", handler)
		const deleteHandler = (post: PostObj)=>{
			// setAutoCurrentId((v)=>{
			// 	if (v === post.id) {
			// 		return null;
			// 	}
			// 	return v;
			// })
			// setForceCurrentId((v)=>{
			// 	if (v === post.id) {
			// 		return null;
			// 	}
			// 	return v;
			// })
			setPosts((posts)=>posts.filter(e=>e!==post));
		}
		client.on("postDeleted", deleteHandler)
		return ()=>{
			client.removeListener("postAdded", handler)
			client.removeListener("postDeleted", deleteHandler)
		};
	}, [user])
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
											if (group)
												query.group = group;
											let mostRecent = posts[posts.length-1];
											if (mostRecent) {
												query.before = mostRecent.createdAt;
											}
											const res = await client.getPosts(query);
											// duplicate bug appears because posts may change while still getting posts
											// posts that start from the middle is being appended to a newer version
											setPosts([...posts, ...res.posts]);
										}}
										hasMore={hasMore}
										loader={<GhostPost/>}
									>
										{posts.map(({id})=>(
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
