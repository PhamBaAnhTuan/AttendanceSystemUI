import { formatDate, formatDateTime } from "@/utils/formatTime";
import { TableColumnsType } from "antd";
import dayjs, { Dayjs } from "dayjs";

export interface RecognizedTableType {
   key: string | null;
   id: number | null;
   fullname: string | null;
   recognized_time: Dayjs | null;
}
export const recognizedColumns: TableColumnsType<RecognizedTableType> = [
   {
      title: <h4>ID</h4>,
      dataIndex: "id",
      width: 70
   },
   {
      title: <h4>Họ và tên</h4>,
      dataIndex: "fullname",
      width: 150
   },
   {
      title: <h4>Thời gian điểm danh</h4>,
      dataIndex: "recognized_time",
      defaultSortOrder: 'descend',
      sorter: (a, b) => {
         return dayjs(a.recognized_time, formatDateTime).valueOf() - dayjs(b.recognized_time, formatDateTime).valueOf();
      },
      width: 150
   }
];
