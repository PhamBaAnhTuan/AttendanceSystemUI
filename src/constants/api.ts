// export const API_URL = "https://660d2bd96ddfa2943b33731c.mockapi.io/api/users/";

// export const API_BASE = "http://172.21.1.130:8000";
export const API_BASE = "http://127.0.0.1:8000";
export const API_URL = "http://127.0.0.1:8000/api";
export const CLOUD_URL = "https://api.cloudinary.com/v1_1/dx69v1c83/image/upload";

export const API = {
	USER_INFO: `${API_BASE}/user/userinfo/`,

	TEACHERS: `${API_BASE}/user/?role_id=teacher`,
	TEACHER_SUBJECT: `${API_BASE}/api/teacher-subject/`,
	TEACHER_CLASS: `${API_BASE}/api/teacher-class/`,

	STUDENTS: `${API_BASE}/user/?role_id=student`,
	MAJOR: `${API_BASE}/api/major/`,

	CLASSES: `${API_BASE}/api/classes/`,
	CLASS_SUBJECT: `${API_BASE}/api/class-subject/`,
	CLASS_ROOM: `${API_BASE}/api/class-room/`,

	SUBJECTS: `${API_BASE}/api/subjects/`,

	ROOMS: `${API_BASE}/api/rooms/`,
	ROOM_SUBJECT: `${API_BASE}/api/room-subject/`,

	ATTENDANCE: `${API_BASE}/face_recog/attendance/`,
	// ATTENDANCE: `${API_BASE}/attendance/take_attendance/`,

	PERIOD: `${API_BASE}/api/period/`,
	SCHEDULE: `${API_BASE}/api/schedule/`,
};
export const API_AUTH = {
	SIGNIN: `${API_BASE}/user/signin/`,
	SIGNUP: `${API_BASE}/user/signup/`,
};
