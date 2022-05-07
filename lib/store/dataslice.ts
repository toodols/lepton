import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { stat } from "fs";
import {Client, ClientUser} from "lepton-client";
import { client } from "../client";

export const dataSlice = createSlice({
	name: "Data",
	initialState: {
		posts: [] as string[],
	},
	reducers: {
		resetPosts(state) {
			state.posts = [];
		},
		onPostDeleted(state, action: PayloadAction<string>) {
			state.posts = state.posts.filter(id => id !== action.payload);
		},
		// postid
		onPostAdded(state, action: PayloadAction<string>){
			state.posts = [action.payload, ...state.posts];
		},
		onPostsLoadedNew(state, action: PayloadAction<string[]>) {
			state.posts = [...action.payload, ...state.posts];
		},
		onPostsLoadedOld(state, action: PayloadAction<string[]>) {
			state.posts = [...state.posts, ...action.payload];
		}
	}
});

export const { resetPosts, onPostAdded, onPostsLoadedOld, onPostDeleted } = dataSlice.actions;