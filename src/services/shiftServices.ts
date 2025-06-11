import axios from "axios";
// api
import { API } from "@/constants/api";

export const getShiftList = async (token: string | null, setShiftList: (v: any) => void) => {
	try {
		const res = await axios.get(`${API.SHIFT}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		console.log("get Shift list res:", data);
		setShiftList(data);
	} catch (error: any) {
		console.error("get Shift list error: ", error?.response?.data || error?.message);
	}
};
