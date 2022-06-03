// router for api requests
// favored over next.js's router cause um... it's just not that versatile

import {Application} from "express"

import signInHandler from "./signin"
import signUpHandler from "./signup"
import usersMeHandler from "./users/@me";
import userLookupHandler from "./users/userid";
import createPostHandler from "./posts/create";
import getPostsHandler from "./posts/get";
import deletePostHandler from "./posts/delete";
import createCommentHandler from "./comments/create";
import getCommentsHandler from "./comments/get";
import deleteCommentHandler from "./comments/delete";

export function apiRouter(app: Application) {
	app.post("/api/signin", signInHandler)
	app.post("/api/signup", signUpHandler)
	
	app.post("/api/posts/create", createPostHandler)
	app.get("/api/posts/get", getPostsHandler)
	app.post("/api/posts/delete", deletePostHandler)

	app.post("/api/comments/create", createCommentHandler)
	app.get("/api/comments/get", getCommentsHandler)
	app.post("/api/comments/delete", deleteCommentHandler)

	app.get("/api/users/@me", usersMeHandler)
	app.get("/api/users/:userid", userLookupHandler)
}