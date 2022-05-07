import { combineReducers, configureStore, createSlice, createStore, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "lepton-client";
import { clientSlice } from "./clientslice";
import { dataSlice } from "./dataslice";
import { settingsModalSlice } from "./settingsmodal";

interface MainState {
	sidebarOpen: boolean;
	signInMenuOpen: boolean,
	signInMenuType: "signin" | "signup" | "forgot" | "reset",
	createPostModalOpen: boolean,
}

const mainSlice = createSlice({
	name: "Main",
	initialState: {
		sidebarOpen: false,
		signInMenuOpen: false,
		signInMenuType: "signin",
		createPostModalOpen: false,
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
		}
	}
});


export const store = configureStore(
	{
		reducer: combineReducers({
			settingsModal: settingsModalSlice.reducer,
			client: clientSlice.reducer,
			main: mainSlice.reducer,
			data: dataSlice.reducer,
		})
	}
)

export const { setSidebarOpen, setSignInModalOpen, setCreatePostModalOpen, setSigninMenuType } = mainSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
