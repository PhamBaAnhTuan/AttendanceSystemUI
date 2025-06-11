import axios from "axios";
// api
import { API } from "@/constants/api";

export const getMajorList = async (
	token: string | null,
	facultyID: number | undefined,
	setMajorList: (v: any) => void,
) => {
	const URL = facultyID ? `${API.MAJOR}?faculty_id=${facultyID}` : `${API.MAJOR}`;
	try {
		const res = await axios.get(URL, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		console.log("get Major list res:", data);
		setMajorList(data);
	} catch (error: any) {
		console.error("get Major list error: ", error?.response?.data || error?.message);
	}
};
