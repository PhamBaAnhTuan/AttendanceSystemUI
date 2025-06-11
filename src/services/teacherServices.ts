import axios from "axios";
// api
import { API, API_AUTH } from "@/constants/api";
import { turnToArray } from "@/utils/turnToArray";
import dayjs from "dayjs";
import { formatDate } from "@/utils/formatTime";
import { formatImageNameFile } from "@/utils/formatImageNameFile";

export const fetchUserInfo = async (
	token: string | null,
	dispatch: (v: any) => void,
	getUserInfo: (v: any) => void,
) => {
	try {
		if (!token) {
			throw new Error("No authentication token found");
		} else {
			const res = await axios.get(`${API.USER_INFO}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			dispatch(getUserInfo(res.data));
			console.log("User info fetched successfully: ", res.data);
		}
	} catch (error) {
		console.error("Failed to fetch user info:", error);
	}
};

export const getTeacherList = async (token: string | null, setTeacherList: (v: any) => void) => {
	try {
		const res = await axios.get(`${API.TEACHERS}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		console.log("get Teacher list res: ", data);
		setTeacherList(data);
	} catch (error: any) {
		console.error("get Teacher list error: ", error?.response?.data || error?.message);
	}
};

// Hàm xử lý submit form
export const addUserMethod = async (
	token: string | null,
	setLoading: (v: any) => void,
	values: any,
	subjectSelected: number[],
	showMessage: (type: string, message: string) => void,
	router: (v: any) => void,
) => {
	setLoading(true);
	try {
		const formData = new FormData();
		const fields = ["fullname", "email", "password", "address", "phone_number", "date_of_birth", "avatar", "role"];
		fields.forEach((field) => {
			let value = values[field];
			if (field === "date_of_birth") {
				try {
					value = dayjs(value).format(formatDate);
				} catch (err) {
					console.warn("Invalid date_of_birth format:", value);
				}
			}
			if (field === "role") {
				value = "teacher";
			}
			if (field === "avatar") {
				value = formatImageNameFile(values.avatar, "Teacher", values.fullname);
			}
			//
			formData.append(field, value);
			console.log(`💥${field}:`, value);
		});

		const res = await axios.post(`${API_AUTH.SIGNUP}`, formData);
		const newTeacherID = res.data?.id;
		const newRole = res.data?.role.name;
		const newTeacherFullname = res.data?.fullname;
		if (newTeacherID) {
			await addTeacherSubjectRelation(token, newTeacherID, subjectSelected);
		}
		showMessage("loading", "Thêm giáo viên thành công!\nChuyển sang trang thêm nhận diện khuôn mặt");
		router.replace(
			`/teacher/camera?id=${newTeacherID}&role=${newRole}&fullname=${encodeURIComponent(newTeacherFullname)}`,
		);
	} catch (error: any) {
		const errorData = error?.response?.data?.detail;
		// Kiểm tra lỗi cụ thể
		if (errorData === "Email already exists!") {
			showMessage("error", "Email này đã tồn tại, vui lòng nhập Email khác!");
		} else if (errorData === "Phone number already exists!") {
			showMessage("error", "Số điện thoại đã tồn tại, vui lòng nhập Số điện thoại khác!");
		}
		console.error("Add User error: ", errorData);
	} finally {
		setLoading(false);
	}
};

export const getTeacherSubjectRelation = async (
	token: string | null,
	teacherID: number | null,
	setTeacherSubjectRelation: (v: any) => void,
) => {
	try {
		const res = await axios.get(`${API.TEACHER_SUBJECT}?teacher_id=${teacherID}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		console.log("get Teacher-Subject relation res: ", data);
		const subjects = data?.map((item: any) => item?.subject);
		console.log("subjects relation: ", subjects);
		setTeacherSubjectRelation(subjects);
	} catch (error: any) {
		console.error("get Teacher-Subject relation error: ", error?.response?.detail || error?.message);
	}
};

export const addTeacherSubjectRelation = async (token: string | null, teacherID: number, subjectIDs: number[]) => {
	const subjectID = turnToArray(subjectIDs);
	if (subjectID.length === 0) {
		console.warn("There is no subject ID to add!");
		return;
	} else {
		const subjectsPayload = subjectID?.map((subjectId) => ({
			teacher_id: teacherID,
			subject_id: subjectId,
		}));
		// console.log("Subject payload to add: ", subjectsPayload);
		try {
			const res = await axios.post(API.TEACHER_SUBJECT, subjectsPayload, {
				headers: { Authorization: `Bearer ${token}` },
			});
			console.log(`➕ Thêm thành công Teacher-Subject: `, res.data);
		} catch (error) {
			console.error(`❌ Lỗi thêm Teacher-Subject: `, error);
		}
	}
};

export const getTeacherClassRelation = async (
	token: string | null,
	teacherID: number,
	subjectID: number | undefined,
	setTeacherClassRelation: (v: any) => void,
) => {
	try {
		const URL = subjectID
			? `${API.TEACHER_CLASS_SUBJECT}?teacher_id=${teacherID}&subject_id=${subjectID}`
			: `${API.TEACHER_CLASS_SUBJECT}?teacher_id=${teacherID}`;
		const res = await axios.get(URL, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		const data = res.data;
		console.log("💥💥💥get Teacher-Class relation res: ", data);
		setTeacherClassRelation(data);
	} catch (error: any) {
		console.error("get Teacher-Class relation error: ", error?.response?.detail || error?.message);
	}
};
