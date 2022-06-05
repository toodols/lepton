/**
 * 
 */

import {Request, Response} from "express";
import { getUserFromAuth } from "./util";

interface Data {
   
};

export default async function handler(req: Request, res: Response<Data | Error>) {
	res.status(501).json({error: "Not implemented"});
	// const user = await getUserFromAuth(req, res);
	
}
