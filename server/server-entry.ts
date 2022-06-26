// entry point for server
// it's a mess but who cares
import express, { Request, Response } from "express";
import next from "next";
import { apiRouter } from "./api";
import bodyparser from "body-parser";
import * as socketio from "socket.io";
import http from "http";
import yargs from "yargs";
import jwt from "jsonwebtoken";
import {createClient} from "redis";
import { jwt_secret, REDIS_URI } from "./env";
import { createAdapter } from "@socket.io/redis-adapter";
import { DatabaseTypes, users } from "./database";
import "./generated-items"
import { ObjectId } from "mongodb";
import {instrument} from "@socket.io/admin-ui";
import path from "path";

const args = await yargs(process.argv).argv;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const port = args.port || process.env.PORT || 3000;

await nextApp.prepare()
const app = express();
export const io = new socketio.Server({
	cors: {
		origin: ["https://admin.socket.io"],
		credentials: true,
	}
});

const server = http.createServer(app)
io.attach(server);
app.use(bodyparser.json());

instrument(io, {
	auth: false
});

export const redisClient = createClient({
	url: REDIS_URI
});

const subscriber = redisClient.duplicate();

await subscriber.connect()
await redisClient.connect();
io.adapter(createAdapter(redisClient, subscriber));

apiRouter(app);

io.on('connection', (socket: socketio.Socket) => {
	let joinedGroups: string[] = [];
	let watchingGroups: string[] = [];

	function updateRooms(newJoined: string[], newWatching: string[]=watchingGroups) {
		let currentRooms = new Set([...joinedGroups, ...watchingGroups]);
		let newRooms = new Set([...newJoined, ...newWatching]);
		socket.join(Array.from(newRooms).map(e=>`group:${e}`));
		for (const room of Array.from(currentRooms).filter(room => !newRooms.has(room))) {
			socket.leave(room);
		};
		joinedGroups = newJoined;
		watchingGroups = newWatching;
	}
	let currentUserId: string; 
	socket.on("auth", async (token: string)=>{
		const inner = token.replace(/^Bearer\s+/, "");
		const e = jwt.verify(inner, jwt_secret);

		
		if (typeof e === "string") {
			return {error: "token doesn't work"};
		} else {
			socket.leave(`user:${currentUserId}`);
			currentUserId = e.user;
			socket.join(`user:${currentUserId}`);
			if (
				!(
					e.permission &&
					(e.permission === DatabaseTypes.Permission.ALL ||
						e.permission & DatabaseTypes.Permission.GROUP_EVENTS)
				)
			) {
				return { error: "Insufficient permissions" };
			}
			
			const user = await users.findOne({ _id: new ObjectId(e.user) }) ?? undefined;
			if (user) {
				updateRooms(user.groups.map(e=>e.toString()))
			} else {
				return {error: "user not found"};
			}
		}
	})

	socket.on("watchingGroups", (groups: string[])=>{
		updateRooms(joinedGroups, groups.filter(e=>e!==undefined));
	})

	socket.on('disconnect', () => {
		console.log('client disconnected');
	})
});
app.all('*', (req: any, res: any) => handle(req, res));

server.listen(port, () => {
	console.log(`> Ready on http://localhost:${port}`);
});


// const app = express();
// const io = new SocketIOServer();
// const server = http.createServer(app)
// io.attach(server);
// io.on("connection", (socket) => {
// 	console.log("socket connected");
// })

// app.use(bodyparser.json());

// apiRouter(app);
// app.all("*", (req: Request, res: Response) => {
// 	return handle(req, res);
// });
// app.listen(port, (err?: any) => {
// 	if (err) throw err;
// 	console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
// });
