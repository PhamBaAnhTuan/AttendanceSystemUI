import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
	id: number;
	title: string;
	completed: boolean;
	createdAt: string;
}

interface AuthState {
	user: UserInfo[];
	isAuthenticated: boolean;
	isLoading: boolean;
}

const initialState: AuthState = {
	user: [],
	isAuthenticated: false,
	isLoading: false,
};

export const todoSlice = createSlice({
	name: "todos",
	initialState,
	reducers: {},
});

export const {} = todoSlice.actions;

export default todoSlice.reducer;
