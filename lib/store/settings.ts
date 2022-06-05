import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { client } from "lib/client";

export const themes = {
	light: {
		css: `
		:root {
			--color-sidebar: #ffffff;
			--color-topbar: #f5f5f5;
			--color-topbar-button: #f5f5f5;
			--color-topbar-button-hover: #e5e5e5;
			--color-account-selection-interface: #f5f5f5;
			--color-post-background: #ffffff;
			--color-comment-hover: #f5f5f5;
			--color-comment: #ffffff;
			--color-background: #ffffff;
			--color-text: #000000;
			--color-button-default: #eeeeee;
		}
		`,
	},
	dark: {
		css: `
		:root {
			--color-sidebar: #1a1a1a;
			--color-topbar: #2a2a2a;
			--color-topbar-button: #2a2a2a;
			--color-topbar-button-hover: #1a1a1a;
			--color-account-selection-interface: #1a1a1a;
			--color-post-background: #1a1a1a;
			--color-comment-hover: #1a1a1a;
			--color-comment: #1a1a1a;
			--color-background: #1a1a1a;
			--color-text: #ffffff;
			--color-button-default: #3a3a3a;
		}
		`,
	}
};

type settings = {theme: keyof typeof themes};

//@ts-ignore
const initialState: { isEditing: boolean, settings: settings, originalSettings: settings} = {
	isEditing: false,
	settings: {
		theme: "light",
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
	name: "SettingsModal",
	initialState: initialState,
	reducers: {
		saveSettings: (state) => {
			console.log("saving settings");
			state.originalSettings = {...state.settings};
			console.log(state.originalSettings);
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
