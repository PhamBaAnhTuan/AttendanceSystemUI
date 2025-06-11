import dayjs, { Dayjs } from "dayjs";
import { TableColumnsType } from "antd";
import { formatDate } from "@/utils/formatTime";

export interface EntityType {
	id: string | any;
	name: string;
	subscription: string | null;
}

enum RoleName {
	Admin = "admin",
	Teacher = "teacher",
	Student = "student",
}

export type UserInfoType = {
	id: number | any;
	fullname: string;
	email: string;
	phone_number: string | null;
	address: string | null;
	date_of_birth: Dayjs | null;
	avatar: string | null;
	role: {
		name: RoleName;
	};
};

export interface TableDataType {
	key: number | null;
	date: string | null;
	shift: string | null;
	teacher: string | null;
	room: string | number;
	class: string | number;
	subject: string;
}
export const columns: TableColumnsType<TableDataType> = [
	{
		title: <h4>Ngày</h4>,
		dataIndex: "date",
		defaultSortOrder: 'descend',
		sorter: (a, b) => {
			return dayjs(a.date, formatDate).valueOf() - dayjs(b.date, formatDate).valueOf();
		},
		width: 150
	},
	{
		title: <h4>Ca học</h4>,
		dataIndex: "shift",
		width: 150
	},
	{
		title: <h4>Giáo viên</h4>,
		dataIndex: "teacher",
		width: 150
	},
	{
		title: <h4>Phòng</h4>,
		dataIndex: "room",
		defaultSortOrder: 'descend',
		sorter: (a, b) => {
			return Number(a.room) - Number(b.room)
		},
		width: 150
	},
	{
		title: <h4>Lớp</h4>,
		dataIndex: "class",
		width: 150
	},
	{
		title: <h4>Môn</h4>,
		dataIndex: "subject",
		width: 150
	},
];

export interface SessionTableDataType {
	key: string | null | any;
	date: string | null | any;
	start_time: string | null | any;
	end_time: string | null | any;
	teacher: string | null | any;
	subject: string | any;
	class: string | number | any;
	student_count: string | null;
	actions: any;
}


export interface SessionDetailTableDataType {
	key: string | null | any;
	date: Dayjs | any;
	id: number | null | any;
	student: string | null;
	class: string | null;
	start_time: string | null | any;
	end_time: string | null | any;
	isActive: boolean | null | any;
}

export interface AttendanceDetailType {
	id: number;
	session_name: string | null;
	start_time: Dayjs | null;
	end_time: Dayjs | null;
	created_by: string | number | any;
	classes: EntityType[] | any;
	subject: EntityType[] | any;
	attendances: object | any;
	attendance_count: number;
	student_count: number
}
