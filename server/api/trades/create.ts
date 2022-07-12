import { Request, Response } from "express";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const sendTradeGuard = createGuard({
	
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = sendTradeGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	// todo
}
