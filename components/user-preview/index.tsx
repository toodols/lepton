import { User } from "../../lib/client";

export function UserPreview({user}: {user: User}) {
	return <div>
		{user.username}
	</div>
}