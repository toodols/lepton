import { Extra, ReqErr, constructURL, defaultHeaders } from "./util";

export async function delete_(path: `/api/users/${string}`, extra: Extra): Promise<ReqErr>;
export async function delete_(path: `/api/posts/${string}`, extra: Extra): Promise<ReqErr>;
export async function delete_(path: `/api/comments/${string}`, extra: Extra): Promise<ReqErr>;
export async function delete_(path: `/api/groups/${string}`, extra: Extra): Promise<ReqErr>;
export async function delete_(path: string, extra: Extra): Promise<any> {
	const url = constructURL(path, {});
	return fetch(url, {
		method: "DELETE",
		headers: {
			...defaultHeaders,
			...(extra.token ? { "Authorization": `Bearer ${extra.token}` } : {}),
		},
	});
}
