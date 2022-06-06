// provides some utility functions for the api just to handle some common error messages, especially authorization and body.

import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { auth, users } from "../database";

export interface Error {
	error: string;
}

export enum Permission {
	ALL = 1,
	COMMENT = 2,
	POST = 4,
}

type Checkable = (input: unknown)=>CheckResult<any>;
type Guard = {optional: true, value: Checkable} |  Checkable | Exclude<{[key: string]: Guard}, /* Easy way to prevent bugs */ string>;
type Result<T extends Guard> = T extends {[key: string]: Checkable | Guard} ? {[K in keyof T]: Result<T[K]>} : T extends Checkable ? Exclude<ReturnType<T>, {error: any}>["value"] : T extends {optional: true, value: Checkable} ?  Result<T["value"]> | null : never;
type Input<T extends Guard> = T extends {[key: string]: Checkable | Guard} ? {[key in keyof T]: Input<T[key]>} : T extends Checkable ? string : never;
export function createGuard<T extends Guard>(obj: T): (t: Input<T>) => CheckResult<Result<T>> {
	const checkObject = (obj: any, t: any): CheckResult<any> =>{
		let result = {} as any;
		for (const prop of obj as any) {
			let v;
			if (!t[prop]) {
				if ( !obj[prop].optional) {
					return {error: `Missing ${prop}`};
				}
				continue;
			}
			if (typeof obj[prop] === "function") {
				v = obj[prop](t[prop]);
			} else if (typeof obj[prop] === "object") {
				v = checkObject(obj[prop], t[prop]);
			}
			if ("error" in v) {
				return v
			} else {
				result[prop] = v.value;
			}
		}
		return {value: result};
	}
	return (t: unknown) => {
		if (typeof obj === "object") {
			return checkObject(obj, t);
		} else {
			if (typeof t === "string") {
				return obj(t);
			} else {
				return {
					error: "Bad Input Type",
				};
			}
		}
	}
}

let a = createGuard({count: Checkables.integer})

type CheckResult<T> = {error: string} | {value: T};
export namespace Checkables {
	export function objectId(input: unknown): CheckResult<ObjectId> {
		if (typeof input === "string") {
			try {
				return {value: new ObjectId(input)};
			} catch (e) {
				return {error: "Invalid ObjectId"};
			}
		} else {
			return {error: "Not a string"};
		}
	}
	export function boolean(input: unknown): CheckResult<boolean> {
		if (input === "true") {
			return {value: true};
		} else if (input === "false") {
			return {value: false};
		} else {
			return {error: "Bad Boolean"};
		}
	}
	export function optional<T extends Checkable>(value: T): {optional: true, value: T} {
		return {optional: true, value};
	}
	export function either(options: string[]): (input: string)=>CheckResult<string> {
		return (input: string) => {
			if (options.includes(input)) {
				return {value: input};
			} else {
				return {error: "Bad Option"};
			}
		}
	}
	export function string(input: unknown): CheckResult<string> {
		if (typeof input === "string") {
			return {value: input};
		} else {
			return {error: "Bad String"};
		}
	}
	export function integer(input: unknown): CheckResult<number> {
		const n = parseInt(String(input));
		if (isNaN(n)) return {error: "not an integer"};
		return {value: n};
	}
}

export async function getUserFromAuth(
	req: Request,
	res: Response,
	permission = Permission.ALL
) {
	const token = req.headers.authorization;
	if (!token) {
		res.status(401);
	}
	const authDoc = await auth.findOne({ token });
	if (!authDoc) return void res.status(400).json({ error: "Invalid token" });
	if (
		!(
			authDoc.permission &&
			(authDoc.permission === Permission.ALL ||
				permission & authDoc.permission)
		)
	)
		return void res.status(403).json({ error: "Insufficient permissions" });
	const user = await users.findOne({ _id: authDoc.user });
	if (!user)
		return void res.status(500).json({ error: "Error finding user" });
	return user;
}

