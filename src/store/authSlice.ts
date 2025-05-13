import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { message } from "antd";
import { boolean } from "zod";

interface AuthState {
	loading: boolean;
	error: string | null;
	isAuthenticated: boolean;
	token?: string | null;
	user: object | null;
}

const initialState: AuthState = {
	loading: false,
	error: null,
	isAuthenticated: false,
	token: null,
	user: null,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		signinStart(state) {
			state.loading = true;
			state.error = null;
		},
		signinSuccess(state, action) {
			state.loading = false;
			state.error = null;
			state.isAuthenticated = true;
			state.user = action.payload.user_data;
			state.token = action.payload.access_token;
		},
		signinFailure(state, action) {
			state.loading = false;
			state.error = action.payload;
		},
		signout(state) {
			state.loading = false;
			state.error = null;
			state.isAuthenticated = false;
			state.user = null;
			state.token = null;
		},
	},
});

export const { signinStart, signinSuccess, signinFailure, signout } = authSlice.actions;
export default authSlice.reducer;
