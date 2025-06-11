import axios from "axios";
// api
import { API } from "@/constants/api";

export const getStudentList = async (token: string | null, setStudentList: (v: any) => void) => {
	try {
		const res = await axios.get(`${API.STUDENTS}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		console.log("get Student list res:", data);
		setStudentList(data);
	} catch (error: any) {
		console.error("get Student list error: ", error?.response?.data || error?.message);
	}
};

export const getStudentClassRelation = async (
	token: string | null,
	classID: number | any,
	setStudentList: (v: any) => void,
	setClassName: (v: any) => void,
) => {
	try {
		const response = await axios.get(`${API.STUDENT_CLASS}?class_id=${classID}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = response.data;
		const studentList = data.map((obj: any) => obj.student);
		setStudentList(studentList);
		setClassName(data[0]?.classes?.name);
	} catch (error: any) {
		console.error("Failed to fetch Student-Class:", error?.response?.data || error?.message);
	}
};

export const getStudentClassRelationByStudentID = async (
	token: string | null,
	studentID: number | any,
	setInitialStudentClass: (v: any) => void,
	setClassSelected: (v: any) => void,
) => {
	try {
		const res = await axios.get(`${API.STUDENT_CLASS}?student_id=${studentID}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res?.data;
		const classes = data?.map((cls: any) => cls?.classes?.id);
		setInitialStudentClass(classes);
		setClassSelected(classes);
	} catch (error: any) {
		console.error("Failed to fetch Student-Class:", error?.response?.data || error?.message);
	}
};

export const addStudentClassRelation = async (token: string | null, studentID: number, classID: number[]) => {
	const payload = {
		student_id: studentID,
		class_id: classID,
	};
	try {
		await axios.post(API.STUDENT_CLASS, payload, { headers: { Authorization: `Bearer ${token}` } });
	} catch (error) {
		console.error(`❌ Lỗi thêm Student-Class: `, error);
	}
};
