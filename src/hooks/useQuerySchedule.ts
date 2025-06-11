import { useEffect, useState } from "react";
import axios from "axios";

interface UseScheduleQueryProps {
	token?: string | null;
	API: { SCHEDULE: string };
	scope?: string | null;
	teacherSelected?: string;
	classSelected?: string;
	dateSelected?: string;
	shiftSelected?: string;
	roomSelected?: string;
	subjectSelected?: string;
	setTeacherSelected: (v: any) => void;
	setClassSelected: (v: any) => void;
	setDateSelected: (v: any) => void;
	setShiftSelected: (v: any) => void;
	setRoomSelected: (v: any) => void;
	setSubjectSelected: (v: any) => void;
	setScheduleList: (data: any) => void;
}

export function useScheduleQuery({
	token,
	API,
	scope,
	teacherSelected,
	classSelected,
	dateSelected,
	shiftSelected,
	roomSelected,
	subjectSelected,
	setTeacherSelected,
	setClassSelected,
	setDateSelected,
	setShiftSelected,
	setRoomSelected,
	setSubjectSelected,
	setScheduleList,
}: UseScheduleQueryProps) {
	const [loading, setLoading] = useState(false);
	const [shouldQuery, setShouldQuery] = useState(false);

	const querySchedule = (isQueryAll: boolean) => {
		if (isQueryAll) {
			switch (scope) {
				case "admin":
					setTeacherSelected(undefined);
					setClassSelected(undefined);
					setDateSelected(undefined);
					setShiftSelected(undefined);
					setRoomSelected(undefined);
					setSubjectSelected(undefined);
					break;
				case "teacher":
					setClassSelected(undefined);
					setDateSelected(undefined);
					setShiftSelected(undefined);
					setRoomSelected(undefined);
					setSubjectSelected(undefined);
					break;
				case "student":
					setTeacherSelected(undefined);
					setDateSelected(undefined);
					setShiftSelected(undefined);
					setRoomSelected(undefined);
					setSubjectSelected(undefined);
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

			if (dateSelected) query += `?date=${dateSelected}`;
			if (shiftSelected) query += `${query ? "&" : "?"}period_id=${shiftSelected}`;
			if (teacherSelected) query += `${query ? "&" : "?"}teacher_id=${teacherSelected}`;
			if (roomSelected) query += `${query ? "&" : "?"}room_id=${roomSelected}`;
			if (classSelected) query += `${query ? "&" : "?"}classes_id=${classSelected}`;
			if (subjectSelected) query += `${query ? "&" : "?"}subject_id=${subjectSelected}`;
			if (!token) {
				console.warn("Token is null, cannot fetch");
				return;
			}
			try {
				const res = await axios.get(`${API.SCHEDULE}${query}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				setScheduleList(res.data);
			} catch (error: any) {
				console.error("Get schedule error: ", error?.response?.data);
			} finally {
				setLoading(false);
				setShouldQuery(false);
			}
		};

		fetchSchedule();
	}, [shouldQuery, dateSelected, shiftSelected, teacherSelected, roomSelected, classSelected, subjectSelected]);

	return {
		loading,
		querySchedule, // => dùng trong component
	};
}
