import { CommentData } from "../comment"
import { GroupDataFull } from "../group"
import { PostData } from "../post"
import { constructURL, defaultHeaders, Extra, ReqErr } from "./util"
export async function post(path: `/api/posts/${string}/vote`, body: {value: 1 | 0 | -1}, extra: Extra): Promise<ReqErr | {}>
export async function post(path: `/api/users/${string}/follow`, body: null, extra: Extra): Promise<ReqErr | {alreadyFollowed: boolean}>
export async function post(path: `/api/users/${string}/unfollow`, body: null, extra: Extra): Promise<ReqErr | {alreadyUnfollowed: boolean}>
export async function post(path: `/api/users/${string}/friend`, body: null, extra: Extra): Promise<ReqErr | {accepted: boolean}>
export async function post(path: `/api/users/${string}/unfriend`, body: null, extra: Extra): Promise<ReqErr | {}>
export async function post(path: `/api/sign-in`, body: {username: string, password: string}): Promise<ReqErr | {token: string}>
export async function post(path: `/api/sign-up`, body: {username: string, password: string}): Promise<ReqErr | {token: string}>
export async function post(path: `/api/groups`, body: {name: string, isPublic: boolean, description: string}, extra: Extra): Promise<ReqErr | {group: GroupDataFull}>
export async function post(path: `/api/comments`, body: {content: string, post?: string, replyTo?: string}, extra: Extra): Promise<ReqErr | {comment: CommentData}>
export async function post(path: `/api/posts`, body: {content: string, group?: string}, extra: Extra): Promise<ReqErr | {post: PostData}>
export async function post(path: string, body: any = null, extra: Extra = {}): Promise<any> {
	const url = constructURL(path, {})
	return fetch(url, {
		method: "POST",
		headers: {
			...defaultHeaders,
			...(extra.token ? {"Authorization": `Bearer ${extra.token}`} : {}),
		},
		body: body===null?null:JSON.stringify(body),
	}).then(r=>r.json())
}