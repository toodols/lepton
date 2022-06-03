import { createSlice, CreateSliceOptions, PayloadAction, SliceCaseReducers } from "@reduxjs/toolkit";
import {Client, ClientUser} from "lepton-client";
import { client } from "../client";

export const clientSlice = createSlice({
	name: "Client",
	initialState: {
		username: "",
		isLoggedIn: false,
		userId: "",
		avatar: "",
	},
	reducers: {
		onClientUserChanged(state, action: PayloadAction){
			if (client.clientUser) {
				state.username = client.clientUser.username;
				state.isLoggedIn = true;
				state.userId = client.clientUser.id.toString();
				state.avatar = client.clientUser.avatar;
			} else {
				// state.username = ""; not necessary
				state.isLoggedIn = false;
				state.userId = ""
			}
		}
	}
});

export const { onClientUserChanged } = clientSlice.actions;