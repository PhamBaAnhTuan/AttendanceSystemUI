import axios from "axios";
// api
import { API } from "@/constants/api";

export const getSubjectList = async (token: string | null, setSubjectList: (v: any) => void) => {
	try {
		const res = await axios.get(`${API.SUBJECTS}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		console.log("get Subject list res:", data);
		setSubjectList(data);
	} catch (error: any) {
		console.error("get Subject list error: ", error?.response?.data || error?.message);
	}
};
