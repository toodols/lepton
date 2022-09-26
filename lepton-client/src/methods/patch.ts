import { Settings } from "../types";
import { Extra, constructURL, ReqErr, defaultHeaders } from "./util";


export async function patch(path: "/api/settings", body: Settings, extra: Extra): Promise<ReqErr | {settings: Settings}>
export async function patch(path: string, body: any = null, extra: Extra = {}): Promise<any> {
	const url = constructURL(path, {});
	return fetch(url, {
		method: "PATCH",
		headers: {
			...defaultHeaders,
			...(extra.token ? { "Authorization": `Bearer ${extra.token}` } : {}),
		},
		body: body === null ? null : JSON.stringify(body),
	});
}
