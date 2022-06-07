import { Request, Response } from "express";
import { UserDataFull } from "lepton-client/dist";
import { ObjectId } from "mongodb";
import { users } from "../../database";
import { Converter } from "../../util";
import { Error } from "../util";

interface Data {
	user: UserDataFull
}

export default async function handler(req: Request, res: Response<Data | Error>) {
	const {userid} = req.params;
	if (!userid) return res.status(400).json({error: "Missing userid"});

	const user = await users.findOne({_id: new ObjectId(userid)});
	if (user) {
		res.json({user: Converter.toUserDataFull(user)});
	} else {
		res.status(404).json({error: "User not found"});
	}
}
