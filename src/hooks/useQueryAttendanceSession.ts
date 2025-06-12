import { useEffect, useState } from "react";
import axios from "axios";

interface UseScheduleQueryProps {
	token?: string | null;
	API: { ATTENDANCE: string };
	scope?: string | null;
	teacherSelected?: string;
	subjectSelected?: string;
	classSelected?: string;
	attendanceList?: object | any;
	setTeacherSelected: (v: any) => void;
	setSubjectSelected: (v: any) => void;
	setClassSelected: (v: any) => void;
	setAttendanceList: (v: any) => void;
}

export function useQueryAttendanceSession({
	token,
	API,
	scope,
	teacherSelected,
	classSelected,
	subjectSelected,
	attendanceList,
	setTeacherSelected,
	setClassSelected,
	setSubjectSelected,
	setAttendanceList,
}: UseScheduleQueryProps) {
	const [loading, setLoading] = useState(false);
	const [shouldQuery, setShouldQuery] = useState(false);

	const queryAttendanceList = (isQueryAll: boolean) => {
		if (isQueryAll) {
			switch (scope) {
				case "admin":
					setTeacherSelected(undefined);
					setSubjectSelected(undefined);
					setClassSelected(undefined);
					break;
				case "teacher":
					setSubjectSelected(undefined);
					setClassSelected(undefined);
					break;
			}
		}

		setShouldQuery(true);
	};

	useEffect(() => {
		if (!shouldQuery) return;

		const fetchSchedule = async () => {
			setLoading(true);
			let query = "";

			if (teacherSelected) query += `${query ? "&" : "?"}teacher_id=${teacherSelected}`;
			if (classSelected) query += `${query ? "&" : "?"}class_id=${classSelected}`;
			if (subjectSelected) query += `${query ? "&" : "?"}subject_id=${subjectSelected}`;
			if (!token) {
				console.warn("Token is null, cannot fetch");
				return;
			}
			try {
				const res = await axios.get(`${API.ATTENDANCE}${query}`, {
					headers: {
						"ngrok-skip-browser-warning": "true",
						Authorization: `Bearer ${token}`,
					},
				});
				setAttendanceList(res.data);
				console.log("attend list: ", res.data);
			} catch (error: any) {
				console.error("Get attendance list error: ", error?.response?.data);
			} finally {
				setLoading(false);
				setShouldQuery(false);
			}
		};

		fetchSchedule();
	}, [shouldQuery, teacherSelected, classSelected, subjectSelected]);

	return {
		loading,
		queryAttendanceList,
	};
}
