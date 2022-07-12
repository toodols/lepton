// provides some utility functions for the api just to handle some common error messages, especially authorization and body.

import { Request, Response } from "express";
import { ObjectId, Timestamp, WithId } from "mongodb";
import { auth, database, DatabaseTypes, groupUsers, users } from "../database";
import jwt from "jsonwebtoken";
import { jwt_secret } from "../env";
export interface Error {
	error: string;
}

function checkObject (obj: any, t: any): CheckResult<any> {
	let result = {} as any;
	for (const prop in obj as any) {
		let v;
		if (t[prop]==undefined) {
			if (!obj[prop].optional) {
				return { error: `Missing ${prop}` };
			}
			continue;
		}
		if (typeof obj[prop] === "function") {
			v = obj[prop](t[prop]);
		} else if (typeof obj[prop] === "object") {
			if (obj[prop].optional === true) {
				v = obj[prop].value(t[prop]);
			} else {
				v = checkObject(obj[prop], t[prop]);
			}
		}
		if ("error" in v) {
			return v;
		} else {
			result[prop] = v.value;
		}
	}
	return { value: result };
};

export type Checkable<T=any> = (input: T) => CheckResult<T>;
type Guard =
	| { optional: true; value: Checkable }
	| Checkable
	| Exclude<{ [key: string]: Guard }, /* Easy way to prevent bugs */ string>;
type Result<T extends Guard> = T extends { [key: string]: Checkable | Guard }
	? { [K in keyof T]: Result<T[K]> }
	: T extends Checkable
	? Exclude<ReturnType<T>, { error: any }>["value"]
	: T extends { optional: true; value: Checkable }
	? Result<T["value"]> | null
	: never;
type Input<T extends Guard> = T extends { [key: string]: Checkable | Guard }
	? { [key in keyof T]: Input<T[key]> }
	: T extends Checkable
	? string
	: never;
export function createGuard<T extends Guard>(
	obj: T
): (t: Input<T>) => CheckResult<Result<T>> {

	return (t: unknown) => {
		if (typeof obj === "object") {
			if ("optional" in obj && obj.optional === true) {
				if (t) {
					return { value: null };
				} else {
					return checkObject(obj.value, t);
				}
			} else {
				return checkObject(obj, t);
			}
		} else {
			if (typeof t === "string") {
				return obj(t);
			} else {
				return {
					error: "Bad Input Type",
				};
			}
		}
	};
}

type CheckResult<T> = { error: string } | { value: T };
export namespace Checkables {
	export function objectId(input: unknown): CheckResult<ObjectId> {
		if (typeof input === "string") {
			try {
				return { value: new ObjectId(input) };
			} catch (e) {
				return { error: "Invalid ObjectId" };
			}
		} else {
			return { error: "Not a string" };
		}
	}

	export function array<T>(guard: Checkable<T>) {
		return (input: unknown) => {
			if (Array.isArray(input)) {
				let l = [];
				for (const e of input.map(guard)) {
					if ("error" in e) {
						return {error: "Failed to map array"};
					} else {
						l.push(e.value);
					}
				};
				return { value: l };
			} else {
				return { error: "Not an array" };
			}
		};
	}

	export function obj<T extends Record<string, Guard>>(input: T) {
		return createGuard(input);
	}

	export function boolean(input: unknown): CheckResult<boolean> {
		if (input === true || input === "true") {
			return { value: true };
		} else if (input === false || input === "false") {
			return { value: false };
		} else {
			return { error: "Bad Boolean" };
		}
	}
	export function optional<T extends Checkable>(
		value: T
	): { optional: true; value: T } {
		return { optional: true, value };
	}

	export function or<T>(options: Checkable<T>[]){
		return (input: T) => {
			for (const option of options) {
				const result = option(input);
				if ("error" in result) {
					continue;
				} else {
					return result;
				}
			}
			return { error: "No match" };
		}
	}

	export function enums<T extends string>(
		options: T[]
	): (input: unknown) => CheckResult<T> {
		return (input: unknown) => {
			if (options.includes(input as T)) {
				return { value: input as T };
			} else {
				return { error: "Bad Option" };
			}
		};
	}
	export function string(input: unknown): CheckResult<string> {
		if (typeof input === "string") {
			return { value: input };
		} else {
			return { error: "Bad String" };
		}
	}
	export function integer(input: unknown): CheckResult<number> {
		const n = parseInt(String(input));
		if (isNaN(n)) return { error: "not an integer" };
		return { value: n };
	}
}

/**
 * Tries to get the user from the authorization header inside the request.
 * If the user is not found, response will have appropriate status and error messages.
 */
export async function getUserFromAuth(
	req: Request,
	res: Response,
	permission = DatabaseTypes.Permission.ALL
) {
	const token = req.headers.authorization;
	if (!token) {
		res.status(401);
		return;
	}

	const inner = token.replace(/^Bearer\s+/, "");

	const e = jwt.verify(inner, jwt_secret);
	if (typeof e === "string") {
		return void res.status(401).send({ error: "token doesn't even work" });
	} else {
		if (
			!(
				e.permission &&
				(e.permission === DatabaseTypes.Permission.ALL ||
					permission & e.permission)
			)
		) {
			return void res.status(403).json({ error: "Insufficient permissions" });
		}
		return await users.findOne({ _id: new ObjectId(e.user) }) ?? undefined;
	}
}

export async function withGroupUser(
	user: ObjectId | WithId<DatabaseTypes.User>,
	group: ObjectId | WithId<DatabaseTypes.Group>
) {
	const userid: ObjectId = user instanceof ObjectId ? user : user._id;
	const groupid: ObjectId = group instanceof ObjectId ? group : group._id;

	const guser = await groupUsers.findOne({ user: userid, group: groupid });
	if (!guser) {
		const insertResult = await groupUsers.insertOne({
			user: userid,
			group: groupid,
			createdAt: Timestamp.fromNumber(Date.now()),
			updatedAt: Timestamp.fromNumber(Date.now()),
			isInGroup: true,
		});
		if (insertResult.acknowledged) {
			return await groupUsers.findOne({ _id: insertResult.insertedId });
		} else {
			return null
		}
	}
	return guser;
}
