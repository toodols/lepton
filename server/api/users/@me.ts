import { Request, Response } from "express";
import { ClientInfoData, GroupDataFull, UserDataFull } from "lepton-client";
import { groups } from "../../database";
import { Converter } from "../../util";
import { getUserFromAuth } from "../util";
import { Error } from "../util";

interface Data {
	user: UserDataFull;
	groups: Record<string, GroupDataFull>;
	info: ClientInfoData;
}

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const user = await getUserFromAuth(req, res);
	if (!user) return;

	const foundGroups = await Promise.all(user.groups.map(async (groupId) => {
		const groupData = await groups.findOne({ _id: groupId });
		if (!groupData) {
			console.error(`Group ${groupId} not found`);
		}
		return groupData;
	}))

	res.json({
		user: Converter.toUserDataFull(user),
		info: Converter.toClientInfoData(user),
		groups: foundGroups.reduce<Record<string, GroupDataFull>>((acc, group) => {
			if (group) {
				acc[group._id.toString()] = Converter.toGroupDataFull(group);
			}
			return acc;
		}, {})
	});
}
