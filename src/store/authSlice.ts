import { UserInfoType } from "./../types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
	isAuthenticated?: boolean;
	token?: string | null;
	refresh_token?: string | null;
	info: UserInfoType | null;
	scope?: "admin" | "teacher" | "student";
	isAdmin?: boolean;
	isTeacher?: boolean;
}

const initialState: AuthState = {
	isAuthenticated: false,
	token: null,
	refresh_token: null,
	info: null,
	scope: undefined,
	isAdmin: false,
	isTeacher: false,
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
			state.isAdmin = action.payload.scope === "admin";
			state.isTeacher = action.payload.scope === "teacher";
		},
		getUserInfo(state, action: PayloadAction<UserInfoType>) {
			state.info = action.payload;
		},
		signout(state) {
			state.isAuthenticated = false;
			state.token = null;
			state.refresh_token = null;
			state.info = null;
			state.scope = undefined;
		},
	},
});

export const { signinSuccess, getUserInfo, signout } = authSlice.actions;
export default authSlice.reducer;
