// import { getStudentsAPI } from "@/services/mainService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RoomType {
	id?: number | string | any;
	name?: string;
	description?: string | any;
}

interface RoomState {
	roomList: RoomType[] | any[];
}

const initialState: RoomState = {
	roomList: [],
};

export const RoomSlice = createSlice({
	name: "rooms",
	initialState,
	reducers: {
		getRoom(state, action) {
			state.roomList = action.payload;
		},
		addRoom(state, action: PayloadAction<RoomType>) {
			state.roomList.push(action.payload);
		},
		updateRoom(state, action: PayloadAction<RoomType>) {
			const index = state.roomList.findIndex((room) => room.id === action.payload.id);
			if (index !== -1) {
				state.roomList[index] = action.payload;
			}
		},
		deleteRoom(state, action: PayloadAction<string>) {
			state.roomList.filter((room) => room.id !== action.payload);
		},
	},
});

export const { getRoom, addRoom, updateRoom, deleteRoom } = RoomSlice.actions;

export default RoomSlice.reducer;
