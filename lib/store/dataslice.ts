import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NextRouter } from "next/router";
import { setTitle, store } from ".";
import {client} from "../client";

export const dataSlice = createSlice({
	name: "Data",
	initialState: {
		viewingGroupId: undefined as string | undefined,
		posts: [] as string[],
	},
	reducers: {
		setViewingGroupId(state, {payload: {id, router}}: PayloadAction<{id: string | undefined, router: NextRouter}>) {
			if (state.viewingGroupId === id) return;
			state.viewingGroupId = id;
			if (id) {
				const group = client.groupsCache.get(id)!;
				router.push(`/groups/${group.id}`);
			} else {
				router.push("/");
			}
		},
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

export const { setViewingGroupId, resetPosts, onPostAdded, onPostsLoadedOld, onPostDeleted } = dataSlice.actions;