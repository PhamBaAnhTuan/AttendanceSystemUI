'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { API } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';
import dayjs from 'dayjs';
import { formatDate, formatTime } from '@/utils/formatTime';
import { Button, Space, Table, TableColumnsType, Tag } from 'antd';
// types
import { AttendanceDetailType, SessionDetailTableDataType } from '@/types/types';
// excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function AttendanceDetailPage() {
   const searchParams = useSearchParams();
   const ID = searchParams.get('id');
   const { token, isAdmin } = useAuth()

   const [loading, setLoading] = useState(false)

   const [attendanceDetail, setAttendanceDetail] = useState<AttendanceDetailType | null>(null)
   const [className, setClassName] = useState('')
   const [studentList, setStudentList] = useState([])

   useEffect(() => {
      getAttendanceDetail(ID)
   }, [ID])
   const getAttendanceDetail = async (attendanceID: any) => {
      setLoading(false)
      try {
         const res = await axios.get(`${API.ATTENDANCE}${attendanceID}`,
            {
               headers:
                  { 
                  'ngrok-skip-browser-warning': 'true',
                     Authorization: `Bearer ${token}`
                }
            }
         )
         const data = res.data
         setAttendanceDetail(data)
         // console.log('Get Attendance res: ', data)
         getStudentList(data?.classes?.id)
         setClassName(data?.classes?.name)
      } catch (error: any) {
         console.error('Get Attendance error: ', error?.response?.data)
      } finally {
         setLoading(false)
      }
   }
   const getStudentList = async (classID: string) => {
      setLoading(true)
      try {
         const res = await axios.get(`${API.STUDENT_CLASS}?class_id=${classID}`,
            {
               headers:
                  { 
                  'ngrok-skip-browser-warning': 'true',
                     Authorization: `Bearer ${token}`
                }
            }
         )
         setStudentList(res.data)
         // console.log('Get Class res: ', res)
      } catch (error: any) {
         console.error('Get Class error: ', error?.response?.data)
      } finally {
         setLoading(false)
      }
   }

   const originalData: SessionDetailTableDataType[] = studentList?.map((item: any) => {
      const markedStudents = attendanceDetail?.attendances || [];
      const markedStudentIds = markedStudents?.map((att: any) => att.student_details.id);
      const isPresent = markedStudentIds.includes(item?.student?.id);
      return {
         key: item?.id,
         date: dayjs(attendanceDetail?.start_time).format(formatDate),
         id: item?.student?.id || "Không rõ",
         student: item?.student?.fullname || "Không rõ",
         class: className,
         start_time: isPresent ? dayjs(attendanceDetail?.start_time).format(formatTime) : "--",
         end_time: isPresent && attendanceDetail?.end_time
            ? dayjs(attendanceDetail?.end_time).format(formatTime)
            : "--",
         isActive: isPresent,
      }
   })

   const sessionDetailColumns: TableColumnsType<SessionDetailTableDataType> = [
      {
         title: <h4>Ngày</h4>,
         dataIndex: "date",
         width: 100,
      },
      {
         title: <h4>ID sinh viên</h4>,
         dataIndex: "id",
         width: 70,
      },
      {
         title: <h4>Họ và tên sinh viên</h4>,
         dataIndex: "student",
         width: 150,
      },
      {
         title: <h4>Lớp</h4>,
         dataIndex: "class",
         width: 100,
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
         title: <h4>Trạng thái</h4>,
         dataIndex: "isActive",
         width: 150,
         render: (isActive: boolean) => (
            <Tag color={isActive ? "green" : "red"}>
               {isActive ? "Có mặt" : "Vắng mặt"}
            </Tag>
         ),
         defaultSortOrder: 'descend',
         sorter: (a, b) => {
            return a.isActive - b.isActive
         },
      },
   ];

   const exportToExcel = (data: any[]) => {
      const formattedData = data?.map((item) => ({
         'Ngày điểm danh': item.date,
         'Họ và tên sinh viên': item.student,
         'Thời gian bắt đầu': item.isActive ? item.start_time : '--',
         'Thời gian kết thúc': item.isActive ? item.end_time : '--',
         'Trạng thái': item.isActive ? 'Có mặt' : 'Vắng mặt',
      }));
      const date = formattedData.length > 0 ? formattedData[0]['Ngày điểm danh'] : 'unknown';
      const fileName = `Danh sách điểm danh sinh viên lớp ${className} - ngày ${date}.xlsx`
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSach');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(file, fileName);
   };
   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center', marginBottom: '20px' }}>
            <h1>Danh sách chi tiết phiên điểm danh</h1>
         </div>

         <div >
            <Table<SessionDetailTableDataType>
               columns={sessionDetailColumns}
               dataSource={originalData}
               size="middle"
               bordered
               loading={loading}
               pagination={false}
               scroll={{ x: 'max-content', y: 'calc(100vh - 230px)' }}
            />
         </div>

         <Button color='primary' variant='outlined' onClick={() => exportToExcel(originalData)}>Xuất file Excel</Button>
      </div>
   )
}

export default AttendanceDetailPage
