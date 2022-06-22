import init, {parse_with_serialize} from "../../markup/pkg";

interface Block {
	content: any,
	start: number
	end: number,
	raw: string,
}

let isResolved = false;
init().then(function() {
  isResolved = true;

});
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
			} else {
				return <span style={{ color: "red" }}>{block.raw}</span>;
			}
		})
}
export function MarkupRendered(props: {value: string}) {
	return <div>
		{isResolved ? blocksToJSX(JSON.parse(parse_with_serialize(props.value))) : <span>Loading...</span>}
	</div>
}