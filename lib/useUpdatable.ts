import EventEmitter from "events";
import { useEffect, useState } from "react";

/**
 * This connects to an updatable object and updates the component whenever the object changes.
 * @example
 * function MyComponent(props: {post: Post}){
 * 	 useUpdatable(props.post)
 * }
 */
export function useUpdatable<T extends EventEmitter>(value: T){
	const [_, setState] = useState(0); //counters are the easiest way to get stuff to rerender
	useEffect(()=>{
		// add a new handler to update
		// returns a callback to disconnect the handler.
		const handler = ()=>{
			setState(s=>s+1);
		}
		value.on("update", handler)
		return ()=>{
			value.removeListener("update", handler)
		}
	}, [value])
	return value;
}
