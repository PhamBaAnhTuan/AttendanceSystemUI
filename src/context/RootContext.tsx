"use client";

import { API } from "@/constants/api";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserInfo } from '@/store/authSlice'
import { useAppDispatch } from '@/hooks/useDispatch';

interface ContextType {
	// isAuthenticated: boolean;
	// setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	// token: string | null;
	user: any | object;
	// setUser: React.Dispatch<React.SetStateAction<any>>;
	// signin: (values: []) => void;
	// signout: () => void;
}

const RootContext = createContext<ContextType | undefined>(undefined);

export const RootContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { token } = useAuth();
	const dispatch = useAppDispatch()
	const [user, setUser] = useState<ContextType>();

	useEffect(() => {
		if (typeof token === "string" && token) {
			fetchUserInfo(token);
		}
	}, [token]);

	const fetchUserInfo = async (access_token: string) => {
		try {
			if (!token) {
				throw new Error("No authentication token found");
			} else {
				const res = await axios.get(`${API.USER_INFO}`, {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				});
				dispatch(getUserInfo(res.data));
				console.log("User info fetched successfully:", res.data);
			}
		} catch (error) {
			console.error("Failed to fetch user info:", error);
		}
	}

	return <RootContext.Provider
		value={{
			user
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