import { useSelector, useDispatch } from "react-redux";
import { client } from "../../lib/client";
import { RootState } from "../../lib/store";
import { Post } from "./post";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect } from "react";
import { onPostsLoadedOld, resetPosts } from "../../lib/store/dataslice";



export function Posts() {
	const posts = useSelector((state: RootState) => state.data.posts);
	const dispatch = useDispatch();
	const items = posts.map(id=><Post key={id} post={client.postsCache.get(id)!}/>);
	useEffect(()=>{
		dispatch(resetPosts());
		async function sub(){
			dispatch(onPostsLoadedOld((await client.getPosts()).map(e=>e.id)));
		};
		sub();
	}, [])
	return <>
		<InfiniteScroll dataLength={items.length} next={()=>{
			
		}} hasMore={false} loader={<div>hmmm</div>}>
			{items}
		</InfiniteScroll>
	</>
}