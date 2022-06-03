import { useRef, useEffect } from "react";
// Thank you https://css-tricks.com/multiline-truncated-text-with-show-more-button/

let observer: ResizeObserver;
if (typeof window !== "undefined") {
	observer = new ResizeObserver(entries => {
		for (let entry of entries) {
			if (entry.target.scrollHeight > entry.contentRect.height) {
				entry.target.setAttribute("data-truncated", "true");
			} else {
				entry.target.setAttribute("data-truncated", "false");
			}
		}
	});
}

export function useTruncate<T extends HTMLElement>(){
	const ref = useRef<T>(null);
	useEffect(()=>{
		if (ref.current)
			observer.observe(ref.current);
	}, [])
	return ref;
}