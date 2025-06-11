import axios from "axios";
// api
import { API } from "@/constants/api";

export const getClassList = async (token: string | null, setClassList: (v: any) => void) => {
	try {
		const res = await axios.get(`${API.CLASSES}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		console.log("get Class list res:", data);
		setClassList(data);
	} catch (error: any) {
		console.error("get Class list error: ", error?.response?.data || error?.message);
	}
};
