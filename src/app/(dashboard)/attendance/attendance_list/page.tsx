'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { API } from '@/constants/api';
import { Table, Input, Button, Select, Checkbox, DatePicker } from 'antd';
import type { SelectProps, TableColumnsType } from 'antd';
import type { SearchProps } from 'antd/es/input/Search';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate, formatTime } from '@/utils/formatTime';
import { normalizeString } from '@/utils/normalizeString';
// types
import { sessionColumns, SessionTableDataType } from '@/types/types';

const AttendanceListPage = () => {
   const { token, scope, isAdmin, info } = useAuth()
   const { showMessage } = useMessageContext()
   const [loading, setLoading] = useState(false);

   // 
   const [schedule, setSchedule] = useState<SessionTableDataType[]>([]);
   const originalData: SessionTableDataType[] = schedule.map((sche: any) => {
      return {
         key: sche?.id,
         date: dayjs(sche?.start_time).format(formatDate),
         start_time: dayjs(sche?.start_time).format(formatTime),
         end_time: sche?.end_time ? dayjs(sche?.end_time).format(formatTime) : "Chưa kết thúc",
         teacher: info?.fullname || "Không rõ",
         subject: sche?.subject?.name || "Không rõ",
         class: sche?.classes?.name || "Không rõ",
      }
   })

   const formData = new FormData();
   formData.append('teacher', info?.fullname || '');
   formData.append('start_time', dayjs().format(formatTime));


   const [dateSelected, setDateSelected]: any = useState();
   // teacher
   const [teacherSubjectRelation, setTeacherSubjectRelation]: any = useState([]);
   const [teacherSelected, setTeacherSelected]: any = useState([]);
   // subject
   const [teacherClassSubjectList, setTeacherClassSubjectList]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);
   // class
   const [classSelected, setClassSelected]: any = useState([]);

   const log = () => {
      console.log(
         '🔥 Is Admin: ', isAdmin,
         '\n🔥 Token: ', token,
         '\n🔥 Scope: ', scope,
         '\n🔥 User info: ', info,
         '\n🔥 Schedule: ', schedule,

         '\n Date selected: ', dateSelected,

         // '\n\n Teacher list: ', teacherList,
         // '\n Teacher-Subject list: ', teacherSubjectList,
         '\n Teacher selected: ', teacherSelected,
         // 
         // '\n\n Class list: ', classList,
         // '\n Teacher-Class list: ', teacherClassList,
         '\n Class selected: ', classSelected,
         // 
         // '\n\n Subject list: ', subjectList,
         '\n Subject selected: ', subjectSelected,
      );
   }

   useEffect(() => {
      getTeacherSubjectRelation(info?.id);
      setTeacherSelected(info?.id);
      getTeacherClassSubjectList(info?.id, subjectSelected);
   }, [])
   useEffect(() => {
      if (subjectSelected.length > 0) {
         getTeacherClassSubjectList(info?.id, subjectSelected)
         setClassSelected([]);
      }
   }, [subjectSelected])

   // 
   const getTeacherSubjectRelation = async (teacherID: string | undefined) => {
      try {
         const res = await axios.get(`${API.TEACHER_SUBJECT}?teacher_id=${teacherID}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Teacher-Subject list res:', data);
         setTeacherSubjectRelation(data);
      } catch (error: any) {
         console.error('Failed to fetch Teacher-Subject list:', error?.response?.detail || error?.message);
      }
   }
   // 
   const getTeacherClassSubjectList = async (teacherID: string | undefined, subjectID: string | undefined) => {
      try {
         const res = await axios.get(`${API.TEACHER_CLASS_SUBJECT}?teacher_id=${teacherID}&subject_id=${subjectID}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Teacher-Class-Subject list res:', data);
         setTeacherClassSubjectList(data);
      } catch (error: any) {
         console.error('Failed to fetch Teacher-Class-Subject list:', error?.response?.detail || error?.message);
      }
   }
   const subjectOptions: SelectProps['options'] = Array.from(teacherSubjectRelation.values()).map((subject: any) => ({
      label: subject?.subject?.name,
      value: subject?.subject?.id
   }));
   const handleSubjectSelected = (value: any) => {
      setSubjectSelected(value);
   };
   // 
   const uniqueClassMap = new Map<string, any>();
   teacherClassSubjectList.forEach((cls: any) => {
      const className = cls?.classes?.name;
      if (!uniqueClassMap.has(className)) {
         uniqueClassMap.set(className, cls);
         // console.log('Unique class added:', uniqueClassMap);
      }
   });
   const classOptions: SelectProps['options'] = Array.from(uniqueClassMap.values()).map((cls: any) => ({
      label: cls?.classes?.name,
      value: cls?.classes?.id
   }));
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
   };

   // 
   const handleDateSelected = (value: any) => {
      if (value !== null && typeof value === 'object') {
         try {
            value = dayjs(value).format(formatDate);
            setDateSelected(value);
         } catch (err) {
            console.warn('Invalid date format:', value);
         }
      } else setDateSelected(undefined)
   };

   const getQuery = async () => {
      setLoading(true);
      try {
         const res = await axios.get(`${API.ATTENDANCE}?teacher_id=${info?.id}`, {
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

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h2>Danh sách Phien diem danh</h2>
         </div>
         <div className='header'>
            <DatePicker
               size='large'
               style={{ width: '15%' }}
               format={formatDate}
               onChange={handleDateSelected}
               placeholder='Tìm ngày'
            />

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
               onClick={getQuery}
            ><h5>Tìm</h5></Button>
            <Button
               color="primary"
               variant="solid"
               size='large'
               onClick={getQuery}
            ><h5>Tìm tất cả</h5></Button>
         </div>
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
         <Button
            color="primary"
            variant="solid"
            size='large'
            onClick={log}
         ><h5>LOG</h5></Button>
      </div>
   )
}

export default AttendanceListPage;
