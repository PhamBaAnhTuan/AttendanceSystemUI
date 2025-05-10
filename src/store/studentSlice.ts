import { getStudentsAPI } from "@/services/studentService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StudentType {
	gender?: string;
	name?: string;
	email?: string;
	avatar?: string;
	loading: boolean;
}

interface StudentState {
	isLoading: boolean;
	error: string | null;
	studentList: StudentType[] | any[];
}

const initialState: StudentState = {
	isLoading: false,
	error: null,
	studentList: [],
};

export const fetchStudentsAction = createAsyncThunk("students/fetchStudentsAction", async () => {
	return await getStudentsAPI();
});

export const studentSlice = createSlice({
	name: "students",
	initialState,
	reducers: {
		// Thêm sinh viên mới
		// addStudent: (state, action: PayloadAction<Student>) => {
		// 	state.students.push(action.payload);
		// },
		// // Cập nhật thông tin sinh viên
		// updateStudent: (state, action: PayloadAction<Student>) => {
		// 	const index = state.students.findIndex((s) => s.id === action.payload.id);
		// 	if (index !== -1) {
		// 		state.students[index] = action.payload;
		// 	}
		// },
		// // Xóa sinh viên theo ID
		// deleteStudent: (state, action: PayloadAction<number>) => {
		// 	state.students = state.students.filter((s) => s.id !== action.payload);
		// },
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchStudentsAction.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(fetchStudentsAction.fulfilled, (state, action) => {
				state.studentList = action.payload;
				state.isLoading = false;
			})
			.addCase(fetchStudentsAction.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.error.message || "Something went wrong";
			});
	},
});

export const {} = studentSlice.actions;

export default studentSlice.reducer;
