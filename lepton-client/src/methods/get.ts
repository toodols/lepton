import { ClientInfoData } from "../client-info";
import { CommentData } from "../comment";
import { GroupDataFull } from "../group";
import { ItemData } from "../item";
import { PostData } from "../post";
import { UserDataFull } from "../user";
import { Extra, ReqErr, constructURL, defaultHeaders } from "./util";

export function get(path: "/api/get-user-by-username", query: {username: string}): Promise<{user: UserDataFull} | ReqErr>
export function get(path: "/api/groups", query: {name: string}): Promise<{groups: GroupDataFull[]} | ReqErr>

export function get(path: "/api/posts", query: {
	t?: string;
	before?: string;
	group?: string;
	user?: string;
}): Promise<{
	hasMore: boolean;
	posts: PostData[];
	users: UserDataFull[];
	comments: CommentData[];
} | ReqErr>

export function get(path: `/api/items/${string}`): Promise<{item: ItemData} | ReqErr>

export function get(path: `/api/posts/${string}/comments`, query: {
	before?: string;
}): Promise<{
	comments: CommentData[];
	users: UserDataFull[];
	hasMore: boolean;
}>
export function get(path: "/api/users/@me", query: {}, extra: Extra): Promise<ReqErr | {
	user: UserDataFull;
	info: ClientInfoData;
	groups: Record<string, GroupDataFull>;
	items: Record<string, ItemData>
}>

export function get(path: `/api/users/${string}`, query: {}, extra: Extra): Promise<ReqErr | {
	user: UserDataFull;
}>
export function get(path: "/api/users", query: {}, extra: Extra): Promise<ReqErr>
export async function get(path: string, query: Record<string, any> = {}, extra: Extra = {}): Promise<any> {
	const url = constructURL(path, query)
	return fetch(url, {
		headers: {
			...defaultHeaders,
			...(extra.token ? {"Authorization": `Bearer ${extra.token}`} : {}),
		}
	}).then(r=>r.json())
}
