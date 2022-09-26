import {exec} from 'child_process';
import next from "next";
import { config } from 'dotenv-flow';
import express from "express";
import http from "http";
config();
const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

if (dev) {
	const app = express();
	const server = http.createServer(app)
	const nextApp = next({dev: true});
	await nextApp.prepare();
	const handle = nextApp.getRequestHandler();
	app.all("*", (req,res)=>{
		// console.log("Requesting", req.url);
		return handle(req,res)
	});
	const child = exec(`export ROCKET_ENV=development; cd api; cargo run`)
	child.stdout?.pipe(process.stdout);

	server.listen(port, () => {
		console.log(`> Ready on http://localhost:${port}`);
	});
}