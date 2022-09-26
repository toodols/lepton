import { CommentData } from "../comment";
import { PostData } from "../post";
import { UserDataFull } from "../user";

export const FETCH_BASE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3001" : "idk lmao";

export interface ReqErr {
	error: string;
}

export function constructURL(path: string, query: Record<string, any>) {
	console.log(FETCH_BASE_URL+path);
	const url = new URL(FETCH_BASE_URL+path)
	for (const key in query) {
		url.searchParams.append(key, query[key])
	}
	return url
}
export interface Extra {
	token?: string;
}

export const defaultHeaders = {
	...(process.env.NODE_ENV === "development" && {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "*",
		"Access-Control-Allow-Methods": "*",
	}),
	"Content-Type": "application/json",
}

