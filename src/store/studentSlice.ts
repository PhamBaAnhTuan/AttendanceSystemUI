// import { getStudentsAPI } from "@/services/mainService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StudentType {
	gender?: string;
	id?: number | string | any;
	name?: string;
	email?: string;
	classId?: string;
	address?: string;
	phoneNumber?: number | string;
	avatar?: string | any;
}

interface StudentState {
	studentList: StudentType[] | any[];
}

const initialState: StudentState = {
	studentList: [],
};

export const studentSlice = createSlice({
	name: "students",
	initialState,
	reducers: {
		getStudent(state, action) {
			state.studentList = action.payload;
		},
		addStudent(state, action: PayloadAction<StudentType>) {
			state.studentList.push(action.payload);
		},
		updateStudent(state, action: PayloadAction<StudentType>) {
			const index = state.studentList.findIndex((student) => student.id === action.payload.id);
			if (index !== -1) {
				state.studentList[index] = action.payload;
			}
		},
		deleteStudent(state, action: PayloadAction<string>) {
			state.studentList.filter((student) => student.id !== action.payload);
		},
	},
});

export const { getStudent, addStudent, updateStudent, deleteStudent } = studentSlice.actions;

export default studentSlice.reducer;
