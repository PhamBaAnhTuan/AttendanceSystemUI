'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { API } from '@/constants/api';
import { Button, Select, DatePicker, Space, Table } from 'antd';
import type { SelectProps, TableColumnsType } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
import { useRouter } from 'next/navigation';
import { useQueryAttendanceSession } from '@/hooks/useQueryAttendanceSession';
// utils
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate, formatTime } from '@/utils/formatTime';
import { normalizeString } from '@/utils/normalizeString';
// types
import { SessionTableDataType, UserInfoType, EntityType } from '@/types/types';
// components
import { AttendanceSessionTable } from '@/components/AttendanceSessionTable';
import { getTeacherClassRelation, getTeacherList, getTeacherSubjectRelation } from '@/services/teacherServices';
import { getSubjectList } from '@/services/subjectServices';
import { getClassList } from '@/services/classServices';

const AttendanceListPage = () => {
   const router = useRouter()
   const { token, scope, isAdmin, info } = useAuth()
   const { showMessage } = useMessageContext()
   const API_URL = isAdmin ? API.ATTENDANCE : `${API.ATTENDANCE}?teacher_id=${info?.id}`;
   // teacher
   const [teacherList, setTeacherList] = useState<UserInfoType[]>([]);
   const [teacherSelected, setTeacherSelected]: any = useState([]);
   // attendance
   const [attendanceList, setAttendanceList] = useState<SessionTableDataType[]>([]);
   // subject
   const [subjectList, setSubjectList] = useState<EntityType[]>([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);
   const [teacherSubjectRelation, setTeacherSubjectRelation]: any = useState([]);
   // class
   const [classList, setClassList] = useState<EntityType[]>([]);
   const [classSelected, setClassSelected]: any = useState([]);
   const [teacherClassRelation, setTeacherClassRelation]: any = useState([]);


   useEffect(() => {
      getTeacherList(token, setTeacherList)
      queryAttendanceList(true)
      if (isAdmin) {
         getSubjectList(token, setSubjectList)
         getClassList(token, setClassList)
      } else {
         if (info) setTeacherSelected(info?.id);
         getTeacherSubjectRelation(token, teacherSelected, setTeacherSubjectRelation);
         getTeacherClassRelation(token, teacherSelected, subjectSelected, setTeacherClassRelation);
      }
   }, [])
   // 
   const attendanceData: SessionTableDataType[] = attendanceList?.map((attend: any) => {
      const teacherName = teacherList.find((teacher: UserInfoType) => teacher.id === attend?.created_by)?.fullname;
      return {
         key: attend?.id,
         date: dayjs(attend?.start_time).format(formatDate),
         start_time: dayjs(attend?.start_time).format(formatTime),
         end_time: attend?.end_time ? dayjs(attend?.end_time).format(formatTime) : "Chưa kết thúc",
         teacher: isAdmin ? teacherName || "Không rõ" : info?.fullname || "Không rõ",
         subject: attend?.subject?.name || "Không rõ",
         class: attend?.classes?.name || "Không rõ",
         student_count: `${attend?.attendance_count}/${attend?.student_count}` || "Khong ro si so",
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
         width: 120,
         defaultSortOrder: 'descend',
         sorter: (a, b) => {
            return dayjs(a.date, formatDate).valueOf() - dayjs(b.date, formatDate).valueOf();
         },
      },
      {
         title: <h4>Thời gian bắt đầu</h4>,
         dataIndex: "start_time",
         defaultSortOrder: 'descend',
         sorter: (a, b) => {
            return dayjs(a.start_time, formatTime).valueOf() - dayjs(b.start_time, formatTime).valueOf();
         },
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
         width: 130,
      },
      {
         title: <h4>Hành động</h4>,
         dataIndex: "actions",
         width: 130,
         fixed: "right", // cố định bên phải nếu muốn
         render: (_text, record) => (
            <Space>
               <Button type="link" onClick={() => handleDetail(record)}><h5>Chi tiết</h5></Button>
            </Space>
         ),
      },
   ];
   // 
   const subjectOptions: SelectProps['options'] = isAdmin
      ? Array.from(subjectList.values())?.map((subject: any) => ({
         label: subject?.name,
         value: subject?.id
      }))
      : Array.from(teacherSubjectRelation.values())?.map((subject: any) => ({
         label: subject?.name,
         value: subject?.id
      }));
   const handleSubjectSelected = (value: any) => {
      setSubjectSelected(value);
   };
   // 
   const uniqueClassMap = new Map<string, any>();
   teacherClassRelation.forEach((cls: any) => {
      const className = cls?.classes?.name;
      if (!uniqueClassMap.has(className)) {
         uniqueClassMap.set(className, cls);
      }
   });
   const classOptions: SelectProps['options'] = isAdmin
      ? Array.from(classList.values())?.map((cls: any) => ({
         label: cls?.name,
         value: cls?.id
      }))
      : Array.from(uniqueClassMap.values())?.map((cls: any) => ({
         label: cls?.classes?.name,
         value: cls?.classes?.id
      }))
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
   };

   const { loading, queryAttendanceList } = useQueryAttendanceSession({
      token, API, scope,
      teacherSelected, subjectSelected, classSelected, attendanceList,
      setTeacherSelected, setSubjectSelected, setClassSelected, setAttendanceList
   })

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách phiên điểm danh</h1>
         </div>
         <div className='session-list-header'>
            <Select
               allowClear
               size='large'
               title='Tìm môn học'
               placeholder="Tìm môn học"
               showSearch
               style={{ width: '15%' }}
               value={subjectSelected}
               onChange={handleSubjectSelected}
               options={subjectOptions}
               filterOption={(input, option) =>
                  normalizeString(option?.label?.toString() || '').includes(
                     normalizeString(input)
                  )
               }
            />
            <Select
               allowClear
               size='large'
               title='Tìm lớp học'
               placeholder="Tìm lớp học"
               showSearch
               style={{ width: '15%' }}
               value={classSelected}
               onChange={handleClassSelected}
               options={classOptions}
               filterOption={(input, option) =>
                  normalizeString(option?.label?.toString() || '').includes(
                     normalizeString(input)
                  )
               }
            />

            <Button
               color="primary"
               variant="solid"
               size='large'
               onClick={() => queryAttendanceList(false)}
            ><h5>Tìm</h5></Button>
            <Button
               color="primary"
               variant="solid"
               size='large'
               onClick={() => queryAttendanceList(true)}
            ><h5>Tìm tất cả</h5></Button>
         </div>
         <div >
            <Table<SessionTableDataType>
               columns={sessionColumns}
               dataSource={attendanceData}
               size="middle"
               bordered
               loading={loading}
               pagination={false}
               scroll={{ x: 'max-content', y: 'calc(100vh - 230px)' }}
            />
         </div>
      </div>
   )
}

export default AttendanceListPage;
