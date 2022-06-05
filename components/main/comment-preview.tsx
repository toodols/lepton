import {Comment as CommentObject} from "../../lib/client";

export function CommentPreview({comment}: {comment: CommentObject}) {
	return <button>
		{comment.author.username}
		{comment.content}
	</button>
}