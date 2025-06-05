import { Dayjs } from "dayjs";
import { TableColumnsType } from "antd";

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
	id: string;
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
	key: React.Key;
	date: string | null;
	shift: string | null;
	teacher: string | null;
	room: string | number;
	class: string | number;
	subject: string;
}
export const columns: TableColumnsType<TableDataType> = [
	{
		title: "Ngày",
		dataIndex: "date",
	},
	{
		title: "Ca học",
		dataIndex: "shift",
	},
	{
		title: "Giáo viên",
		dataIndex: "teacher",
	},
	{
		title: "Phòng",
		dataIndex: "room",
	},
	{
		title: "Lớp",
		dataIndex: "class",
	},
	{
		title: "Môn",
		dataIndex: "subject",
	},
];

export interface SessionTableDataType {
	key: React.Key;
	date: string | null;
	start_time: string | null;
	end_time: string | null;
	teacher: string | null;
	subject: string;
	class: string | number;
}
export const sessionColumns: TableColumnsType<SessionTableDataType> = [
	{
		title: "Ngày",
		dataIndex: "date",
	},
	{
		title: "Thời gian bắt đầu",
		dataIndex: "start_time",
	},
	{
		title: "Thời gian kết thúc",
		dataIndex: "end_time",
	},
	{
		title: "Giáo viên",
		dataIndex: "teacher",
	},
	{
		title: "Lớp",
		dataIndex: "class",
	},
	{
		title: "Môn",
		dataIndex: "subject",
	},
];
