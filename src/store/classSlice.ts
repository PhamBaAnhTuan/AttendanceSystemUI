// import { getStudentsAPI } from "@/services/mainService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ClassType {
	id?: number | string | any;
	name?: string;
	description?: string | any;
}

interface ClassState {
	classList: ClassType[] | any[];
}

const initialState: ClassState = {
	classList: [],
};

export const classSlice = createSlice({
	name: "classes",
	initialState,
	reducers: {
		getClass(state, action) {
			state.classList = action.payload;
		},
		addClass(state, action: PayloadAction<ClassType>) {
			state.classList.push(action.payload);
		},
		updateClass(state, action: PayloadAction<ClassType>) {
			const index = state.classList.findIndex((classObj) => classObj.id === action.payload.id);
			if (index !== -1) {
				state.classList[index] = action.payload;
			}
		},
		deleteClass(state, action: PayloadAction<string>) {
			state.classList.filter((classObj) => classObj.id !== action.payload);
		},
	},
});

export const { getClass, addClass, updateClass, deleteClass } = classSlice.actions;

export default classSlice.reducer;
