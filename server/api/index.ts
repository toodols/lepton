// router for api requests
// favored over next.js's router cause um... it's just not that versatile

import {Application} from "express"

import signInHandler from "./signin"
import signUpHandler from "./signup"
import lookupMeHandler from "./users/@me";
import lookupUserHandler from "./users/lookup";
import createPostHandler from "./posts/create";
import getPostsHandler from "./posts/get";
import deletePostHandler from "./posts/delete";
import createCommentHandler from "./comments/create";
import getCommentsHandler from "./comments/get";
import deleteCommentHandler from "./comments/delete";
import searchUsersHandler from "./users/search";
import createGroupHandler from "./groups/create";
import deleteGroupHandler from "./groups/delete";
import searchGroupsHandler from "./groups/search";
import editGroupHandler from "./groups/edit";
import updateSettingsHandler from "./updatesettings";
import editPostHandler from "./posts/edit";
import editCommentHandler from "./comments/edit";
import votePostHandler from "./posts/vote";
import deleteAccountHandler from "./deleteaccount";
import lookupGroupHandler from "./groups/lookup";
import lookupItemHandler from "./items/lookup";
import friendUserHandler from "./users/friend";
import unfriendUserHandler from "./users/unfriend";

export function apiRouter(app: Application) {
	app.post("/api/signin", signInHandler)
	app.post("/api/signup", signUpHandler)
	app.post("/api/updatesettings", updateSettingsHandler)
	app.post("/api/deleteaccount", deleteAccountHandler)

	app.post("/api/posts/create", createPostHandler)
	app.get("/api/posts/get", getPostsHandler)
	app.post("/api/posts/delete", deletePostHandler)
	app.post("/api/posts/edit", editPostHandler)
	app.post("/api/posts/vote", votePostHandler)

	app.post("/api/comments/create", createCommentHandler)
	app.get("/api/comments/get", getCommentsHandler)
	app.post("/api/comments/delete", deleteCommentHandler)
	app.post("/api/comments/edit", editCommentHandler)

	app.get("/api/users/lookup/@me", lookupMeHandler)
	app.get("/api/users/lookup/:userid", lookupUserHandler)
	app.get("/api/searchusers", searchUsersHandler)
	app.post("/api/users/friend", friendUserHandler)
	app.post("/api/users/unfriend", unfriendUserHandler)

	app.post("/api/groups/create", createGroupHandler)
	app.post("/api/groups/delete", deleteGroupHandler)
	app.post("/api/groups/edit", editGroupHandler)
	app.get("/api/groups/search", searchGroupsHandler)
	app.get("/api/groups/lookup/:groupid", lookupGroupHandler)

	app.get("/api/items/lookup/:itemid", lookupItemHandler)
}