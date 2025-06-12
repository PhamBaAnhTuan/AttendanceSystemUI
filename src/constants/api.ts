// export const API_URL = "https://660d2bd96ddfa2943b33731c.mockapi.io/api/users/";
// export const API_BASE = "http://127.0.0.1:8000";
export const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const API = {
	USERS: `${API_BASE}/user/`,
	USER_INFO: `${API_BASE}/user/userinfo/`,

	TEACHERS: `${API_BASE}/user/?role_id=teacher`,
	TEACHER_SUBJECT: `${API_BASE}/api/teacher-subject/`,
	TEACHER_CLASS_SUBJECT: `${API_BASE}/api/teacher-class-subject/`,

	STUDENTS: `${API_BASE}/user/?role_id=student`,
	STUDENT_CLASS: `${API_BASE}/api/student-class/`,

	FACULTY: `${API_BASE}/api/faculty/`,
	MAJOR: `${API_BASE}/api/major/`,

	CLASSES: `${API_BASE}/api/classes/`,
	CLASS_SUBJECT: `${API_BASE}/api/class-subject/`,
	CLASS_ROOM: `${API_BASE}/api/class-room/`,

	SUBJECTS: `${API_BASE}/api/subjects/`,

	ROOMS: `${API_BASE}/api/rooms/`,
	ROOM_SUBJECT: `${API_BASE}/api/room-subject/`,

	ATTENDANCE: `${API_BASE}/face_recog/attendance/`,
	FACE_TRAINING: `${API_BASE}/face_recog/face_training/`,

	SHIFT: `${API_BASE}/api/period/`,
	SCHEDULE: `${API_BASE}/api/schedule/`,
};
export const API_AUTH = {
	SIGNIN: `${API_BASE}/user/signin/`,
	SIGNUP: `${API_BASE}/user/signup/`,
};
