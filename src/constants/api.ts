// export const API_URL = "https://660d2bd96ddfa2943b33731c.mockapi.io/api/users/";

export const API_BASE = "http://127.0.0.1:8000";
export const API_URL = "http://127.0.0.1:8000/api";

export const API = {
	TEACHERS: `${API_BASE}/api/teachers/`,
	TEACHER_SUBJECT: `${API_BASE}/api/teacher-subject/`,
	STUDENTS: `${API_BASE}/api/students/`,
	STUDENT_SUBJECT: `${API_BASE}/api/student-subject/`,
	CLASSES: `${API_BASE}/api/classes/`,
	CLASS_SUBJECT: `${API_BASE}/api/class-subject/`,
	CLASS_TEACHER: `${API_BASE}/api/class-teacher/`,
	CLASS_ROOM: `${API_BASE}/api/class-room/`,
	SUBJECTS: `${API_BASE}/api/subjects/`,
	ROOMS: `${API_BASE}/api/rooms/`,
	ROOM_SUBJECT: `${API_BASE}/api/room-subject/`,
	ATTENDANCE: `${API_BASE}/api/attendance/`,
};
export const API_AUTH = {
	SIGNIN: `${API_BASE}/user/signin/`,
	SIGNUP: `${API_BASE}/user/signup/`,
};
