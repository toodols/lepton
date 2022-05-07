import { createSlice } from "@reduxjs/toolkit";

export const settingsModalSlice = createSlice({
	name: "SettingsModal",
	initialState: {
		  isOpen: false
	},
	reducers: {
		  open: (state) => {
			  state.isOpen = true;
		  },
		  close: (state) => {
			  state.isOpen = false;
		  }
	  }
});

export const { open, close } = settingsModalSlice.actions;