import { useEffect, useState } from "react";
import { EventEmitter } from "stream";

let isResolved = false;

let parse_with_serialize: (value: string)=>any;

// prevent next.js from trying to do things that make my project not work
// this could actually become a problem in the future if i want to pre-render posts with markup
if (typeof window !== "undefined") {
	import("../../markup/pkg").then((value)=>{
		value.default().then(()=>{
			isResolved = true;
			parse_with_serialize = value.parse_with_serialize;
			markupLoadedEvent.emit("markupLoaded");
		})
	});
}

const markupLoadedEvent = new EventEmitter();

interface Block {
	content: any,
	start: number
	end: number,
	raw: string,
}

function blocksToJSX(blocks: any[]) {
	return blocks.map((block: any) => {
			if (block.content.Text) {
				return <span>{block.raw}</span>;
			} else if (block.content.Italic) {
				let rendered = blocksToJSX(block.content.Italic);
				return <i>{rendered}</i>;
			} else if (block.content.Bold) {
				let rendered = blocksToJSX(block.content.Bold);
				return <b>{rendered}</b>;
			} else if (block.content.Underline) {
				let rendered = blocksToJSX(block.content.Underline);
				return <u>{rendered}</u>;
			} else if (block.content.Strikethrough) {
				let rendered = blocksToJSX(
					block.content.Strikethrough);
				return <s>{rendered}</s>;
			} else if (block.content.Spoiler) {
				let rendered = blocksToJSX(block.content.Spoiler);
				return <span className="spoiler">{rendered}</span>;
			// code inline cannot have i tags and stuff inside
			} else if (block.content.CodeInline) {
				return <code>{block.content.CodeInline}</code>;
			} else {
				return <span style={{ color: "red" }}>{block}</span>;
			}
		})
}
export function MarkupRendered(props: {value: string}) {
	const [markupLoaded, setMarkupLoaded] = useState(isResolved);
	useEffect(()=>{
		if (!isResolved) {
			const handler = ()=>{
				setMarkupLoaded(true);
			};
			markupLoadedEvent.on("markupLoaded", handler);
			return ()=>{
				markupLoadedEvent.off("markupLoaded", handler);
			}
		}
	})
	return <div>
		{isResolved ? blocksToJSX(JSON.parse(parse_with_serialize(props.value))) : <span>Loading...</span>}
	</div>
}