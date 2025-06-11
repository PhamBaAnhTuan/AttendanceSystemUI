import axios from "axios";
// api
import { API } from "@/constants/api";

export const getRoomList = async (token: string | null, setRoomList: (v: any) => void) => {
	try {
		const res = await axios.get(`${API.ROOMS}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		console.log("get Room list res:", data);
		setRoomList(data);
	} catch (error: any) {
		console.error("get Room list error: ", error?.response?.data || error?.message);
	}
};
