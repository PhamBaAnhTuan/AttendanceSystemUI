import { TableColumnsType } from "antd";

export interface UserInfoType {
	gender?: string;
	id?: number | string | any;
	name?: string;
	email?: string;
	classId?: string;
	address?: string;
	phoneNumber?: number | string;
	avatar?: string | any;
}

export interface ClassType {
	id?: number | string | any;
	name?: string;
	description?: string | any;
}

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
