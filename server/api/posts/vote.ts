import { Request, Response } from "express";
import { Timestamp } from "mongodb";
import { auth, posts, users } from "../../database";
import { io } from "../../server-entry";
import { Converter, hash } from "../../util";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const createPostGuard = createGuard({
	post: Checkables.objectId,
	type: Checkables.either<"down" | "up">(["down", "up"])
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = createPostGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });

	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const post = await posts.findOne({ _id: result.value.post });
	if (!post) return res.status(400).json({ error: "Post not found" });

	
	// todo
}
