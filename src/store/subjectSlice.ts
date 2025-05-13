// import { getStudentsAPI } from "@/services/mainService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SubjectType {
	id?: number | string | any;
	name?: string;
	credit?: number;
	description?: string | any;
}

interface SubjectState {
	subjectList: SubjectType[] | any[];
}

const initialState: SubjectState = {
	subjectList: [],
};

export const subjectSlice = createSlice({
	name: "subjects",
	initialState,
	reducers: {
		getSubject(state, action) {
			state.subjectList = action.payload;
		},
		addSubject(state, action: PayloadAction<SubjectType>) {
			state.subjectList.push(action.payload);
		},
		updateSubject(state, action: PayloadAction<SubjectType>) {
			const index = state.subjectList.findIndex((subject) => subject.id === action.payload.id);
			if (index !== -1) {
				state.subjectList[index] = action.payload;
			}
		},
		deleteSubject(state, action: PayloadAction<string>) {
			state.subjectList.filter((student) => student.id !== action.payload);
		},
	},
});

export const { getSubject, addSubject, updateSubject, deleteSubject } = subjectSlice.actions;

export default subjectSlice.reducer;
