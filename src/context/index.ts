"use-client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

export interface Student {
	id: number;
	fullName: string;
	email: string;
	avatar: string;
}

interface StudentContextType {
	students: Student[];
	setStudents: (students: Student[]) => void;
}

export const StudentContext = createContext<any>(null);
export const StudentContextProvider = ({ children }: { children: ReactNode }) => {
	return <StudentContext.Provider value={{}}>{children}</StudentContext.Provider>;
};

export const useAuth = () => {
	const value = useContext(StudentContext);
	if (!value) {
		throw new Error("useAuth must be used within a StudentProvider");
	}
	return value;
};
