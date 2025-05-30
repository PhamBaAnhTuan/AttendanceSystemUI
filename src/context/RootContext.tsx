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
	const [loading, setLoading] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();

	// useEffect(() => {
	// 	const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
	// 	setIsAuthenticated(!!token);
	// }, []);

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