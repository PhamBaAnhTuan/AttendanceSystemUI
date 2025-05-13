import axios from "axios";
// api
import { API_URL, API } from "@/constants/api";
// redux
import { getTeacher, addTeacher, updateTeacher, deleteTeacher } from "@/store/teacherSlice";
import { getStudent, addStudent, updateStudent, deleteStudent } from "@/store/studentSlice";
import { getSubject, addSubject, updateSubject, deleteSubject } from "@/store/subjectSlice";
import { getClass, addClass, updateClass, deleteClass } from "@/store/classSlice";
import { getRoom, addRoom, updateRoom, deleteRoom } from "@/store/roomSlice";
import { Dispatch } from "@reduxjs/toolkit";

export const getApiAction = (token: string | any, id: number | string | any, type: string) => {
	return async (dispatch: Dispatch) => {
		const response = await axios.get(
			`${
				type === "teacher"
					? API.TEACHERS
					: type === "student"
					? API.STUDENTS
					: type === "subject"
					? API.SUBJECTS
					: type === "class"
					? API.CLASSES
					: API.ROOMS
			}${id ? id : ""}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);
		const data = response?.data;
		type === "teacher"
			? dispatch(getTeacher(data))
			: type === "student"
			? dispatch(getStudent(data))
			: type === "subject"
			? dispatch(getSubject(data))
			: type === "class"
			? dispatch(getClass(data))
			: dispatch(getRoom(data));
		console.log("Get success: ", data);
		return data;
	};
};

export const postImgAction = async (token: string | any, value: any, type: string) => {
	// return async (dispatch: Dispatch) => {
	const response = await axios.post(`${type === "teacher" ? API.TEACHERS : API.STUDENTS}upload-image/`, value, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	console.log("Post img success: ", value);
};

export const postApiAction = (token: string | any, form: any, type: string) => {
	return async (dispatch: Dispatch) => {
		const response = await axios.post(
			`${
				type === "teacher"
					? API.TEACHERS
					: type === "student"
					? API.STUDENTS
					: type === "subject"
					? API.SUBJECTS
					: type === "class"
					? API.CLASSES
					: API.ROOMS
			}`,
			form,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);
		const data = response?.data;
		type === "teacher"
			? dispatch(addTeacher(data))
			: type === "student"
			? dispatch(addStudent(data))
			: type === "subject"
			? dispatch(addSubject(data))
			: type === "class"
			? dispatch(addClass(data))
			: dispatch(addRoom(data));
		console.log("Post success: ", data);
		return data;
	};
};

export const updateApiAction = (token: string | any, form: any, type: string) => {
	return async (dispatch: Dispatch) => {
		const response = await axios.patch(
			`${
				type === "teacher"
					? API.TEACHERS
					: type === "student"
					? API.STUDENTS
					: type === "subject"
					? API.SUBJECTS
					: type === "class"
					? API.CLASSES
					: API.ROOMS
			}`,
			form,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);
		const data = response?.data;
		type === "teacher"
			? dispatch(updateTeacher(data))
			: type === "student"
			? dispatch(updateStudent(data))
			: type === "subject"
			? dispatch(updateSubject(data))
			: type === "class"
			? dispatch(updateClass(data))
			: dispatch(updateRoom(data));
		console.log("Update success: ", data);
		return data;
	};
};

export const deleteApiAction = (token: string | any, id: string | any, type: string) => {
	return async (dispatch: Dispatch) => {
		const response = await axios.delete(
			`${
				type === "teacher"
					? API.TEACHERS
					: type === "student"
					? API.STUDENTS
					: type === "subject"
					? API.SUBJECTS
					: type === "class"
					? API.CLASSES
					: API.ROOMS
			}${id}/`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);
		type === "teacher"
			? dispatch(deleteTeacher(id))
			: type === "student"
			? dispatch(deleteStudent(id))
			: type === "subject"
			? dispatch(deleteSubject(id))
			: type === "class"
			? dispatch(deleteClass(id))
			: dispatch(deleteRoom(id));
		console.log("Delete success: ", id);
	};
};
