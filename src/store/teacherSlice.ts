// import { getTeachersAPI } from "@/services/mainService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TeacherType {
	gender?: string;
	id?: number | string | any;
	name?: string;
	email?: string;
	classId?: string;
	address?: string;
	phoneNumber?: number | string;
	avatar?: string | any;
}

interface TeacherState {
	teacherList: TeacherType[] | any[];
}

const initialState: TeacherState = {
	teacherList: [],
};

export const teacherSlice = createSlice({
	name: "teachers",
	initialState,
	reducers: {
		getTeacher(state, action) {
			state.teacherList = action.payload;
		},
		addTeacher(state, action: PayloadAction<TeacherType>) {
			state.teacherList.push(action.payload);
		},
		updateTeacher(state, action: PayloadAction<TeacherType>) {
			const index = state.teacherList.findIndex((teacher) => teacher.id === action.payload.id);
			if (index !== -1) {
				state.teacherList[index] = action.payload;
			}
		},
		deleteTeacher(state, action: PayloadAction<string>) {
			state.teacherList.filter((teacher) => teacher.id !== action.payload);
		},
	},
});

export const { getTeacher, addTeacher, updateTeacher, deleteTeacher } = teacherSlice.actions;

export default teacherSlice.reducer;
