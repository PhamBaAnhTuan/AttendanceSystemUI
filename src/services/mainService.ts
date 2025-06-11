// import axios from "axios";
// // api
// import { API_URL, API, API_AUTH } from "@/constants/api";

// interface SignInProps {
// 	values: any;
// 	API: { SIGNIN: string };
// 	scope?: string | null;
// 	teacherSelected?: string;
// 	subjectSelected?: string;
// 	classSelected?: string;
// 	attendanceList?: object | any;
// 	setTeacherSelected: (v: any) => void;
// 	setSubjectSelected: (v: any) => void;
// 	setClassSelected: (v: any) => void;
// 	setAttendanceList: (v: any) => void;
// }

// export const signInMethod = async (values: any, setLoading: ) => {
// 	setLoading(true);
// 	try {
// 		const response = await axios.post(API_AUTH.SIGNIN, values);
// 		const data = response.data;
// 		showMessage("success", "Đăng nhập thành công!");
// 		dispatch(signinSuccess(data));
// 	} catch (error: any) {
// 		const errorMsg = error?.response?.data?.detail;
// 		if (errorMsg === "Invalid credentials!") {
// 			showMessage("error", "Thông tin đăng nhập không hợp lệ!");
// 		}
// 		console.log(`Sign in error: `, errorMsg);
// 	} finally {
// 		setLoading(false);
// 	}
// };
