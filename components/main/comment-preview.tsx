import {Comment as CommentObject} from "lepton-client";

export function CommentPreview({comment}: {comment: CommentObject}) {
	return <button>
		{comment.author.username}
	</button>
}