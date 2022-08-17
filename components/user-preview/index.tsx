import { useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { User } from "../../lib/client";

export function UserPreview({user, pos}: {user: User, pos: {x: number, y: number}}) {
	return ReactDOM.createPortal(<div key="user-preview" style={{position: "absolute", left: pos.x, top: pos.y}}>
		{user.username}
	</div>, document.body)
}