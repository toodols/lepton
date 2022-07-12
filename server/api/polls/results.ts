import { Request, Response } from "express";
import { createGuard, Checkables, getUserFromAuth } from "../util";

interface Data {
	
};

const getResultGuard = createGuard({
	id: Checkables.objectId
});

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = getResultGuard(req.body);
	if ("error" in result) return res.status(400).json(result);
	
	// todo
}
