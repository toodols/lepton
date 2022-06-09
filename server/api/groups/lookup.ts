import { Request, Response } from "express";
import { groups, groupUsers } from "../../database";
import { Converter } from "../../util";
import { Checkables, createGuard, Error, getUserFromAuth } from "../util";

interface Data {}

const getGroupGuard = createGuard({
	groupid: Checkables.objectId,
})

export default async function handler(
	req: Request,
	res: Response<Data | Error>
) {
	const result = getGroupGuard(req.params as any);
	if ("error" in result) return res.status(400).json({error: result.error});
	
	const group = await groups.findOne({_id: result.value.groupid});
	if (!group) {
		return res.status(404).json({
			error: "Group not found",
		})
	}
	if (group.isPublic) {
		res.json({
			group: Converter.toGroupDataFull(group),
		});
	} else {
		const user = await getUserFromAuth(req, res);
		if (!user) return;
		const groupUser = await groupUsers.findOne({
			group: group._id,
			isInGroup: true,
			user: user._id,
		});
		if (groupUser) {
			res.json({
				group: Converter.toGroupDataFull(group),
			})
		} else {
			res.status(403).json({
				error: "You are not in this group",
			})
		}
	}


	//todo
}
