import { combineReducers, configureStore, createSlice, createStore, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "lepton-client";
import { client, init } from "lib/client";
import { clientSlice } from "./clientslice";
import { dataSlice } from "./dataslice";
import { settingsSlice } from "./settings";

interface MainState {
	sidebarOpen: boolean;
	signInMenuOpen: boolean,
	signInMenuType: "signin" | "signup" | "forgot" | "reset",
	settingsModalOpen: boolean,
	createPostModalOpen: boolean,
	title: string,
}

const mainSlice = createSlice({
	name: "Main",
	initialState: {
		sidebarOpen: false,
		signInMenuOpen: false,
		settingsModalOpen: false,
		signInMenuType: "signin",
		createPostModalOpen: false,
		title: "...",
	} as MainState,
	reducers: {
		setSidebarOpen: (state, action: PayloadAction<boolean>) => {
			state.sidebarOpen = action.payload;
		},
		setSignInModalOpen(state, action: PayloadAction<boolean>) {
			state.signInMenuOpen = action.payload;
		},
		setSigninMenuType: (state, action: PayloadAction<MainState["signInMenuType"]>) => {
			state.signInMenuType = action.payload;
		},
		setCreatePostModalOpen(state, action: PayloadAction<boolean>) {
			state.createPostModalOpen = action.payload;
		},
		setSettingsModalOpen(state, action: PayloadAction<boolean>) {
			state.settingsModalOpen = action.payload;
		},
		setTitle(state, action: PayloadAction<string>) {
			state.title = action.payload;
		}
	}
});


export const store = configureStore(
	{
		reducer: combineReducers({
			settings: settingsSlice.reducer,
			client: clientSlice.reducer,
			main: mainSlice.reducer,
			data: dataSlice.reducer,
		})
	}
)
init();

export const { setTitle, setSettingsModalOpen, setSidebarOpen, setSignInModalOpen, setCreatePostModalOpen, setSigninMenuType } = mainSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
