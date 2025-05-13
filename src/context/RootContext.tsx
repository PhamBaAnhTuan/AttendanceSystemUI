"use client";

import { API_BASE } from "@/constants/api";
import { message } from "antd";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

const url = API_BASE

interface ContextType {
	// isAuthenticated: boolean;
	// setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	// token: string | null;
	// user: any;
	// setUser: React.Dispatch<React.SetStateAction<any>>;
	// signin: (values: []) => void;
	// signout: () => void;
	messageApi: any;
	contextHolder: React.ReactNode;
	loading: boolean;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const RootContext = createContext<ContextType | undefined>(undefined);

export const RootContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<any>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();

	// useEffect(() => {
	// 	const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
	// 	setIsAuthenticated(!!token);
	// }, []);

	const signin = async (values: any) => {
		setIsAuthenticated(true)
		// setLoading(true);
		// try {
		// 	const response = await axios.post(`${url}/signin/`, values);
		// 	console.log('Response:', response.data);
		// 	const data = response.data;
		// 	setIsAuthenticated(true);
		// 	setToken(data.access_token);
		// 	setUser(data.user_data);
		// 	messageApi.open({
		// 		type: 'success',
		// 		content: 'Sign in thành công!',
		// 	});
		// } catch (error: any) {
		// 	const errorData = error?.response?.data?.error;

		// 	// Kiểm tra lỗi cụ thể
		// 	if (errorData === 'Invalid credentials!') {
		// 		messageApi.open({
		// 			type: 'error',
		// 			content: 'Invalid credentials!',
		// 		});
		// 	} else {
		// 		// Lỗi không xác định
		// 		messageApi.open({
		// 			type: 'error',
		// 			content: `Lỗi không xác định: ${JSON.stringify(errorData)}`,
		// 		});
		// 	}
		// 	console.error('Lỗi chi tiết từ server:', errorData);
		// } finally {
		// 	setLoading(false);
		// }
		// console.log('Sign In')
	};

	const signout = () => {
		if (typeof window !== "undefined") {
			localStorage.removeItem("authToken");
			setIsAuthenticated(false);
		}
		setIsAuthenticated(false);
		console.log('Sign Out')
	};

	return <RootContext.Provider
		value={{
			messageApi, contextHolder,
			loading, setLoading
		}}>
		{children}
	</RootContext.Provider>;
};

export const useRootContext = () => {
	const context = useContext(RootContext);
	if (!context) {
		throw new Error("useRootContext must be used within an RootContextProvider");
	}
	return context;
};