// entry point for server
// it's a mess but who cares
import express, { Request, Response } from "express";
import next from "next";
import { apiRouter } from "./api";
import bodyparser from "body-parser";
import * as socketio from "socket.io";
import http from "http";
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const port = process.env.PORT || 3000;

await nextApp.prepare()
const app = express();
export const io = new socketio.Server();
const server = http.createServer(app)
io.attach(server);
app.use(bodyparser.json());
apiRouter(app);

io.on('connection', (socket: socketio.Socket) => {
	console.log('connection');
	socket.emit('status', 'Hello from Socket.io');

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
