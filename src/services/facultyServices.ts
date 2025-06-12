import axios from "axios";
// api
import { API } from "@/constants/api";

export const getFacultyList = async (token: string | null, setFacultyList: (v: any) => void) => {
	try {
		const res = await axios.get(`${API.FACULTY}`, {
			headers: {
				"ngrok-skip-browser-warning": "true",
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		// console.log("get Faculty list res:", data);
		setFacultyList(data);
	} catch (error: any) {
		console.error("get Faculty list error: ", error?.response?.data || error?.message);
	}
};
