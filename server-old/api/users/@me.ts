import { Request, Response } from "express";
import { ClientInfoData, GroupDataFull, ItemData, UserDataFull } from "lepton-client";
import { ObjectId } from "mongodb";
import { DatabaseTypes, groups, items } from "../../database";
import { Converter } from "../../util";
import { getUserFromAuth } from "../util";
import { Error } from "../util";

interface Data {
	user: UserDataFull;
	groups: Record<string, GroupDataFull>;
	info: ClientInfoData;
	items: Record<string, ItemData>;
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
		user: await Converter.toUserDataFull(user),
		info: await Converter.toClientInfoData(user),
		items: await Promise.all(user.inventory.map(e=>e.item.toString()).filter((e,i,a)=>a.indexOf(e)===i).map(e=>{
			return items.findOne({ _id: new ObjectId(e) });
		})).then(items=>{
			return items.reduce<Record<string, ItemData>>((acc, item)=>{
				if (item) {
					acc[item._id.toString()] = Converter.toItemData(item);
				}
				return acc;
			}, {});
		}),
		groups: foundGroups.reduce<Record<string, GroupDataFull>>((acc, group) => {
			if (group) {
				acc[group._id.toString()] = Converter.toGroupDataFull(group);
			}
			return acc;
		}, {})
	});
}
