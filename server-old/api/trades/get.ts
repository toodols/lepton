import {Request, Response} from "express";
import type { UserDataPartial, PostData, CommentData } from "lepton-client";
import { TradeData } from "lepton-client";
import { Filter, Timestamp, WithId } from "mongodb";
import { comments, DatabaseTypes, posts, users } from "../../database";
import { Converter } from "../../util";
import {Checkables, createGuard, Error} from "../util";

interface Data {
	trades: TradeData[];
};

const getTradesGuard = createGuard({
	before: Checkables.optional(Checkables.integer),
	user: Checkables.optional(Checkables.objectId),
})

export default async function handler(req: Request, res: Response<Data | Error>) {
	const result = getTradesGuard(req.query as any);
	
}
