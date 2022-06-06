import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { client } from "lib/client";

export type Theme = "light" | "dark" | "default"

type Settings = {theme: Theme};

//@ts-ignore
const initialState: { isEditing: boolean, settings: Settings, originalSettings: Settings} = {
	isEditing: false,
	settings: {
		theme: "default",
	}
};

if (typeof localStorage !== "undefined") {
	let settings = localStorage.getItem("settings");
	if (settings) {
		let parsed = JSON.parse(settings);
		initialState.settings = {...initialState.settings, ...parsed};
	}
}
initialState.originalSettings = {...initialState.settings};

export const settingsSlice = createSlice({
	name: "Settings",
	initialState: initialState,
	reducers: {
		saveSettings: (state) => {
			state.originalSettings = {...state.settings};
			state.isEditing = false;
			if (typeof localStorage !== "undefined") {
				localStorage.setItem("settings", JSON.stringify(state.settings));
			}
			if (client.clientUser) {
				client.saveSettings({...state.settings});
			}
		},
		discardSettings: (state) => {
			console.log(state.originalSettings);
			state.settings = {...state.originalSettings};
			state.isEditing = false;
		},
		editSettings: (state, action: PayloadAction<Partial<typeof initialState["settings"]>>)=>{
			state.settings = {...state.settings, ...action.payload};
			state.isEditing = true;
		},
	},
});

export const { discardSettings, editSettings, saveSettings } = settingsSlice.actions;
