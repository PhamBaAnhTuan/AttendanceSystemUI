'use client'
import dayjs from "dayjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TableColumnsType, Button, Space, Table } from "antd";
import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
// types
import { formatDate, formatTime } from "@/utils/formatTime";
import { SessionTableDataType, UserInfoType } from "@/types/types";

export const AttendanceSessionTable = () => {
   const router = useRouter()
   const { token, scope, isAdmin, info } = useAuth()
   const [loading, setLoading] = useState(false);
   const API_URL = isAdmin ? API.ATTENDANCE : `${API.ATTENDANCE}?teacher_id=${info?.id}`;
   // teacher
   const [teachers, setTeachers] = useState<UserInfoType[]>([]);
   // schedule
   const [schedule, setSchedule] = useState<SessionTableDataType[]>([]);
   useEffect(() => {
      getQuery()
      getTeacherList()
   }, [])
   const formData = new FormData();
   formData.append('teacher', info?.fullname || '');
   formData.append('start_time', dayjs().format(formatTime));
   const getQuery = async () => {
      setLoading(true);
      try {
         const res = await axios.get(API_URL, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         setSchedule(data);
         console.log('Get Attendance list res:', data);
      } catch (error: any) {
         console.error('Failed to fetch Attendance list:', error?.response?.data || error?.message);
      } finally {
         setLoading(false);
      }
   }
   // 
   const getTeacherList = async () => {
      setLoading(true);
      try {
         const res = await axios.get(API.TEACHERS, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         })
         const data = res.data
         setTeachers(data)
         console.log('Get teacher res: ', data);
      } catch (error: any) {
         console.error('Failed to fetch teacher:', error?.response?.detail || error?.message);
      } finally {
         setLoading(false);
      }
   };
   // 
   const originalData: SessionTableDataType[] = schedule.map((sche: any) => {
      const teacherName = teachers.find((teacher: UserInfoType) => teacher.id === sche?.created_by)?.fullname;
      return {
         key: sche?.id,
         date: dayjs(sche?.start_time).format(formatDate),
         start_time: dayjs(sche?.start_time).format(formatTime),
         end_time: sche?.end_time ? dayjs(sche?.end_time).format(formatTime) : "Chưa kết thúc",
         teacher: isAdmin ? teacherName || "Không rõ" : info?.fullname || "Không rõ",
         subject: sche?.subject?.name || "Không rõ",
         class: sche?.classes?.name || "Không rõ",
         student_count: `${sche?.attendance_count}/${sche?.student_count}` || "Khong ro si so",
         actions: null
      }
   })

   const handleDetail = (record: SessionTableDataType) => {
      router.push(`/attendance/attendance_detail?id=${record.key}`)
   };

   const sessionColumns: TableColumnsType<SessionTableDataType> = [
      {
         title: <h4>Ngày</h4>,
         dataIndex: "date",
         width: 150,
         defaultSortOrder: 'descend',
         sorter: (a, b) => {
            return dayjs(a.date, formatDate).valueOf() - dayjs(b.date, formatDate).valueOf();
         },
      },
      {
         title: <h4>Thời gian bắt đầu</h4>,
         dataIndex: "start_time",
         width: 150,
      },
      {
         title: <h4>Thời gian kết thúc</h4>,
         dataIndex: "end_time",
         width: 150,
      },
      {
         title: <h4>Giáo viên</h4>,
         dataIndex: "teacher",
         width: 200,
      },
      {
         title: <h4>Lớp</h4>,
         dataIndex: "class",
         width: 150,
      },
      {
         title: <h4>Môn</h4>,
         dataIndex: "subject",
         width: 150,
      },
      {
         title: <h4>Sỉ số sinh viên</h4>,
         dataIndex: "student_count",
         width: 150,
      },
      {
         title: <h4>Hành động</h4>,
         dataIndex: "actions",
         width: 150,
         fixed: "right", // cố định bên phải nếu muốn
         render: (_text, record) => (
            <Space>
               <Button type="link" onClick={() => handleDetail(record)}><h5>Chi tiết</h5></Button>
            </Space>
         ),
      },
   ];

   return (
      <div >
         <Table<SessionTableDataType>
            columns={sessionColumns}
            dataSource={originalData}
            size="middle"
            bordered
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content', y: 'calc(100vh - 230px)' }}
         />
      </div>
   )
}