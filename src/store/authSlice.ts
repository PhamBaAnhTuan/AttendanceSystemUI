import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
	isAuthenticated?: boolean;
	token?: string | null;
	refresh_token?: string | null;
	info?: object | null;
	scope?: string | null;
	isAdmin?: boolean;
}

const initialState: AuthState = {
	isAuthenticated: false,
	token: null,
	refresh_token: null,
	info: null,
	scope: null,
	isAdmin: false,
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		signinSuccess(state, action) {
			state.isAuthenticated = true;
			state.token = action.payload.access_token;
			state.refresh_token = action.payload.refresh_token;
			state.scope = action.payload.scope;
			state.isAdmin = action.payload.scope === "admin" ? true : false;
		},
		signout(state) {
			state.isAuthenticated = false;
			state.token = null;
			state.refresh_token = null;
			state.info = null;
			state.scope = null;
		},
	},
});

export const { signinSuccess, signout } = authSlice.actions;
export default authSlice.reducer;
