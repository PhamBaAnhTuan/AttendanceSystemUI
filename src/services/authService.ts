import axios from "axios";
// api
import { API_AUTH } from "@/constants/api";
// redux
import { signinStart, signinSuccess, signinFailure, signout } from "@/store/authSlice";
import { Dispatch } from "@reduxjs/toolkit";

export const authAction = (credentials: any, message: any, method: string) => {
	return async (dispatch: Dispatch) => {
		try {
			dispatch(signinStart());
			const response = await axios.post(`${method === "signin" ? API_AUTH.SIGNIN : API_AUTH.SIGNUP}`, credentials);
			const data = response?.data;
			message.success("Sign in successfully!");
			dispatch(signinSuccess(data));
			console.log("Response: ", data);
			return data;
		} catch (error: any) {
			const errorMsg = error?.response?.data?.error;
			if (errorMsg === "Invalid credentials!") {
				message.error("Thông tin đăng nhập không hợp lệ!");
			} else if (errorMsg?.username?.[0] === "A user with that username already exists.") {
				message.error("Username đã tồn tại, vui lòng nhập Username khác!");
			}
			console.log(`${method} error: `, error);
			dispatch(signinFailure(errorMsg));
		}
	};
};

// export const signoutAction = () => {
// 	console.log("Sign-out...");
// 	return async (dispatch: Dispatch) => {
// 		try {
// 			dispatch(signout());
// 			console.log("Sign-out successful");
// 		} catch (error: any) {
// 			console.error("Error during sign-out:", error);
// 		}
// 	};
// };
