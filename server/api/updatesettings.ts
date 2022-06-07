/**
 *
 */

import { Request, Response } from "express";
import { Settings } from "lepton-client";
import { users } from "../database";
import { Checkables, createGuard, getUserFromAuth } from "./util";

interface Data {}

const updateSettingsGuard = createGuard({
	avatar: Checkables.optional(Checkables.string),
	description: Checkables.optional(Checkables.string),
	// there's no point in constraining it to light or dark, if the client passes in the wrong one, it's their problem
	theme: Checkables.optional(Checkables.string),
});

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const result = updateSettingsGuard(req.body);
	if ("error" in result) return res.status(400).json({ error: result.error });
	const value = result.value;
	if (Object.keys(value).length === 0)
		return res.status(400).json({ error: "No settings to update" });

	const toUpdate: Partial<Settings> = {};
	if (value.avatar) {
		// todo: check if it's a valid url
		toUpdate["settings.avatar"] = value.avatar;
	}
	if (value.description) {
		// todo: check if its length is valid
		toUpdate["settings.description"] = value.description;
	}
	if (value.theme) {
		toUpdate["settings.theme"] = value.theme;
	}
	console.log("toUpdate", toUpdate);
	users.updateOne(
		{ _id: user._id },
		{
			$set: toUpdate,
		}
	);
	res.json({});
}
