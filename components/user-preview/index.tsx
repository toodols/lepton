import { User } from "../../lib/client";

export function UserPreview({user}: {user: User}) {
	return <div style={{position: "absolute"}}>
		{user.username}
	</div>
}