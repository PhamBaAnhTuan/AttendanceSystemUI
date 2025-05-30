'use client'
import React, { useEffect, useState } from 'react'
// import './schedule.css'
import axios from 'axios';
import { API } from '@/constants/api';
import { Table, Input, Button, Select, Checkbox, DatePicker } from 'antd';
import type { SelectProps, TableColumnsType } from 'antd';
import type { SearchProps } from 'antd/es/input/Search';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useMessageContext } from '@/context/messageContext';
import { useRootContext } from '@/context/rootContext';
// utils
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';
import { normalizeString } from '@/utils/normalizeString';
// types
import { columns, TableDataType } from '@/types/types';

const Schedule = () => {
   const { token, scope, isAdmin, info } = useAuth()
   const { showMessage } = useMessageContext()
   const [loading, setLoading] = useState(false);

   // Helper chuyển shift từ tiếng Anh sang tiếng Việt
   const mapShiftToText = (shift: string): string => {
      switch (shift) {
         case 'morning':
            return '(Buổi sáng)';
         case 'afternoon':
            return '(Buổi chiều)';
         case 'evening':
            return '';
         default:
            return shift;
      }
   };
   // 
   const [schedule, setSchedule] = useState<TableDataType[]>([]);
   const originalData: TableDataType[] = schedule.map(((sche: any) => ({
      key: sche?.id,
      date: sche?.date,
      shift: `${sche?.period.name} ${mapShiftToText(sche?.period.shift)}`,
      teacher: sche?.teacher.fullname,
      room: sche?.room?.name,
      class: sche?.classes?.name,
      subject: sche?.subject?.name,
   })))


   const [dateSelected, setDateSelected]: any = useState();
   // teacher
   const [teacherList, setTeacherList]: any = useState([]);
   const [teacherSelected, setTeacherSelected]: any = useState();
   // shift
   const [shiftList, setShiftList]: any = useState([]);
   const [shiftSelected, setShiftSelected]: any = useState();
   // subject
   const [subjectList, setSubjectList]: any = useState([]);
   const [teacherSubjectList, setTeacherSubjectList]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState();
   // class
   const [classList, setClassList]: any = useState([]);
   const [teacherClassList, setTeacherClassList]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState();
   // room
   const [roomList, setRoomList]: any = useState([]);
   const [roomSelected, setRoomSelected]: any = useState();

   const log = () => {
      console.log(
         '🔥 Is Admin: ', isAdmin,
         '\n🔥 Scope: ', scope,
         '\n🔥 User info: ', info,
         '\n🔥 Schedule: ', schedule,

         '\n Date selected: ', dateSelected,

         '\n\n Teacher list: ', teacherList,
         '\n Teacher-Subject list: ', teacherSubjectList,
         '\n Teacher selected: ', teacherSelected,

         '\n\n Shift list: ', shiftList,
         '\n Shift selected: ', shiftSelected,
         // 
         '\n\n Room list: ', roomList,
         '\n Room selected: ', roomSelected,
         // 
         '\n\n Class list: ', classList,
         '\n Teacher-Class list: ', teacherClassList,
         '\n Class selected: ', classSelected,
         // 
         '\n\n Subject list: ', subjectList,
         '\n Subject selected: ', subjectSelected,
      );
   }

   useEffect(() => {
      getPeriodList()
      getRoomList()
      if (isAdmin) {
         getTeacherList()
         getClassList()
         getSubjectList()
      } else {
         getTeacherSubjectList()
         getTeacherClassList()
         setTeacherSelected(info.id)
      }
      handleQuery(true)
   }, [])

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
   //
   const getTeacherList = async () => {
      try {
         const res = await axios.get(`${API.TEACHERS}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Teacher list res:', data);
         setTeacherList(data);
      } catch (error: any) {
         console.error('Failed to fetch Teacher list:', error?.response?.data || error?.message);
      }
   }
   //
   const getTeacherSubjectList = async () => {
      try {
         const res = await axios.get(`${API.TEACHER_SUBJECT}?teacher_id=${info.id}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Teacher-Subject list res:', data);
         setTeacherSubjectList(data);
      } catch (error: any) {
         console.error('Failed to fetch Teacher-Subject list:', error?.response?.detail || error?.message);
      }
   }
   //
   const getTeacherClassList = async () => {
      try {
         const res = await axios.get(`${API.TEACHER_CLASS}?teacher_id=${info.id}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Teacher-Class list res:', data);
         setTeacherClassList(data);
      } catch (error: any) {
         console.error('Failed to fetch Teacher-Class list:', error?.response?.detail || error?.message);
      }
   }
   // 
   const teacherOptions: SelectProps['options'] = teacherList.map((teacher: any) => ({
      label: teacher?.fullname,
      value: teacher?.id
   }));
   const handleTeacherSelected = (value: any) => {
      setTeacherSelected(value)
   };
   // 
   const getPeriodList = async () => {
      try {
         const res = await axios.get(`${API.PERIOD}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Period list res:', data);
         setShiftList(data);
      } catch (error: any) {
         console.error('Failed to fetch Period list:', error?.response?.data || error?.message);
      }
   }
   // 
   const morningShiftOptions: SelectProps['options'] = shiftList.filter((shift: any) => shift.shift === "morning").map((shift: any) => ({
      label: shift.name,
      value: shift.id,

   }))
   const afternoonShiftOptions: SelectProps['options'] = shiftList.filter((shift: any) => shift.shift === "afternoon").map((shift: any) => ({
      label: shift.name,
      value: shift.id
   }))
   const eveningShiftOptions: SelectProps['options'] = shiftList.filter((shift: any) => shift.shift === "evening").map((shift: any) => ({
      label: shift.name,
      value: shift.id
   }))
   const handleShiftSelected = (value: any) => {
      setShiftSelected(value);
   };
   // 
   const getSubjectList = async () => {
      try {
         const res = await axios.get(`${API.SUBJECTS}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Subject list res:', data);
         setSubjectList(data);
      } catch (error: any) {
         console.error('Failed to fetch Subject list:', error?.response?.data || error?.message);
      }
   }
   // 
   const subjectOptions: SelectProps['options'] = subjectList.length > 0 ? subjectList.map((subject: any) => ({
      label: subject.name,
      value: subject.id
   }))
      : teacherSubjectList.map((subject: any) => ({
         label: subject?.subject.name,
         value: subject?.subject.id
      }))
   const handleSubjectSelected = (value: any) => {
      setSubjectSelected(value);
   };
   // 
   const getClassList = async () => {
      try {
         const res = await axios.get(`${API.CLASSES}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Class list res:', data);
         setClassList(data);
      } catch (error: any) {
         console.error('Failed to fetch Class list:', error?.response?.data || error?.message);
      }
   };
   // 
   const classOptions: SelectProps['options'] = classList.length > 0 ? classList.map((cls: any) => ({
      label: cls.name,
      value: cls.id
   }))
      : teacherClassList.map((cls: any) => ({
         label: cls?.classes.name,
         value: cls?.classes.id
      }))
   // const classOptions: SelectProps['options'] = teacherClassList.map((cls: any) => ({
   //    label: cls?.classes.name,
   //    value: cls?.classes.id
   // }))
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
   };
   // 
   const getRoomList = async () => {
      try {
         const res = await axios.get(`${API.ROOMS}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Room list res:', data);
         setRoomList(data);
      } catch (error: any) {
         console.error('Failed to fetch Room list:', error?.response?.data || error?.message);
      }
   };
   // 
   const roomOptions: SelectProps['options'] = roomList.map((room: any) => ({
      label: room.name,
      value: room.id
   }));
   const handleRoomSelected = (value: any) => {
      setRoomSelected(value);
   };

   // Hàm xử lý submit form
   const handleQuery = async (isQueryAll: boolean) => {
      setLoading(true);
      let query = '';
      if (isQueryAll) {
         setDateSelected(undefined)
         setShiftSelected(undefined)
         if (isAdmin) {
            setTeacherSelected(undefined)
         } else if (teacherSelected) query += `${query ? '&' : '?'}teacher_id=${teacherSelected}`;
         setRoomSelected(undefined)
         setClassSelected(undefined)
         setSubjectSelected(undefined)
      } else {
         if (dateSelected) query += `?date=${dateSelected}`;
         if (shiftSelected) query += `${query ? '&' : '?'}period_id=${shiftSelected}`;
         if (teacherSelected) query += `${query ? '&' : '?'}teacher_id=${teacherSelected}`;
         if (roomSelected) query += `${query ? '&' : '?'}room_id=${roomSelected}`;
         if (classSelected) query += `${query ? '&' : '?'}classes_id=${classSelected}`;
         if (subjectSelected) query += `${query ? '&' : '?'}subject_id=${subjectSelected}`;
      }
      try {
         // console.log('💥query: ', query)
         const res = await axios.get(
            `${API.SCHEDULE}${query}`,
            {
               headers: {
                  'Authorization': `Bearer ${token}`,
               },
            });
         const data = res.data
         console.log('Get schedule res:', data);
         setSchedule(data)
      } catch (error: any) {
         const errorData = error?.response?.data;
         console.error('Lỗi chi tiết từ server:', errorData);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h2>Danh sách thời khóa biểu</h2>
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
               title='Tìm ca học'
               placeholder="Tìm ca học"
               showSearch
               style={{ width: '15%' }}
               value={shiftSelected}
               onChange={handleShiftSelected}
               options={[
                  {
                     label: <span>Buổi sáng</span>,
                     title: 'Buổi sáng',
                     options: morningShiftOptions
                  },
                  {
                     label: <span>Buổi chiều</span>,
                     title: 'Buổi chiều',
                     options: afternoonShiftOptions
                  },
                  {
                     label: <span>Buổi tối</span>,
                     title: 'Buổi tối',
                     options: eveningShiftOptions
                  }
               ]}
               filterOption={(input, option) =>
                  normalizeString(option?.label?.toString() || '').includes(
                     normalizeString(input)
                  )
               }
            />
            {isAdmin && <Select
               allowClear
               size='large'
               title='Tìm giáo viên'
               style={{ width: '15%' }}
               placeholder="Tìm giáo viên"
               showSearch
               value={teacherSelected}
               onChange={handleTeacherSelected}
               options={teacherOptions}
               filterOption={(input, option) =>
                  normalizeString(option?.label?.toString() || '').includes(
                     normalizeString(input)
                  )
               }
            />}

            <Select
               allowClear
               size='large'
               title='Tìm phòng học'
               placeholder="Tìm phòng học"
               showSearch
               style={{ width: '15%' }}
               value={roomSelected}
               onChange={handleRoomSelected}
               options={roomOptions}
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
            <Button
               color="primary"
               variant="solid"
               size='large'
               onClick={() => handleQuery(false)}
            ><h5>Tìm</h5></Button>
            <Button
               color="primary"
               variant="solid"
               size='large'
               onClick={() => handleQuery(true)}
            ><h5>Tìm tất cả</h5></Button>
         </div>
         <div >
            <Table<TableDataType>
               columns={columns}
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

export default Schedule;
