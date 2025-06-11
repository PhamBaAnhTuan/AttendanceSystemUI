'use client'
import React, { useEffect, useState } from 'react'
import { API } from '@/constants/api';
import { Table, Button, Select, DatePicker } from 'antd';
import type { SelectProps } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useScheduleQuery } from '@/hooks/useQuerySchedule';
import { useAppDispatch } from '@/hooks/useDispatch';
import { getUserInfo } from '@/store/authSlice';
// utils
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';
import { mapShiftToText, normalizeString } from '@/utils/normalizeString';
// types
import { columns, TableDataType } from '@/types/types';
// services
import { fetchUserInfo, getTeacherClassRelation, getTeacherList, getTeacherSubjectRelation } from '@/services/teacherServices';
import { getClassList } from '@/services/classServices';
import { getSubjectList } from '@/services/subjectServices';
import { getShiftList } from '@/services/shiftServices';
import { getRoomList } from '@/services/roomServices';

const Schedule = () => {
   const dispatch = useAppDispatch()
   const { token, scope, isAdmin, info } = useAuth()
   // date
   const [dateSelected, setDateSelected]: any = useState();
   // teacher
   const [teacherList, setTeacherList]: any = useState([]);
   const [teacherSelected, setTeacherSelected]: any = useState();
   const [teacherSubjectRelation, setTeacherSubjectRelation]: any = useState([]);
   const [teacherClassRelation, setTeacherClassRelation]: any = useState([]);
   // shift
   const [shiftList, setShiftList]: any = useState([]);
   const [shiftSelected, setShiftSelected]: any = useState();
   // subject
   const [subjectList, setSubjectList]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState();
   // class
   const [classList, setClassList]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState();
   // room
   const [roomList, setRoomList]: any = useState([]);
   const [roomSelected, setRoomSelected]: any = useState();
   // schedule
   const [scheduleList, setScheduleList] = useState<TableDataType[]>([]);

   const scheduleData: TableDataType[] = scheduleList?.map(((sche: any) => ({
      key: sche?.id,
      date: sche?.date,
      shift: `${sche?.period.name} ${mapShiftToText(sche?.period.shift)}`,
      teacher: sche?.teacher.fullname,
      room: sche?.room?.name,
      class: sche?.classes?.name,
      subject: sche?.subject?.name,
   })))

   useEffect(() => {
      fetchUserInfo(token, dispatch, getUserInfo)
      getShiftList(token, setShiftList)
      getRoomList(token, setRoomList)
      if (isAdmin) {
         getTeacherList(token, setTeacherList)
         getClassList(token, setClassList)
         getSubjectList(token, setSubjectList)
         getTeacherClassRelation(token, info?.id, undefined, setTeacherClassRelation)
      } else {
         if (info) setTeacherSelected(info?.id)
         getTeacherSubjectRelation(token, info?.id, setTeacherSubjectRelation)
         getTeacherClassRelation(token, info?.id, undefined, setTeacherClassRelation)
      }
      querySchedule(true)
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
   // teacher options
   const teacherOptions: SelectProps['options'] = teacherList && teacherList?.map((teacher: any) => ({
      label: teacher?.fullname,
      value: teacher?.id
   }));
   const handleTeacherSelected = (value: any) => {
      setTeacherSelected(value)
   };
   // 
   const morningShiftOptions: SelectProps['options'] = shiftList && shiftList?.filter((shift: any) => shift.shift === "morning")?.map((shift: any) => ({
      label: shift.name,
      value: shift.id,

   }))
   const afternoonShiftOptions: SelectProps['options'] = shiftList && shiftList?.filter((shift: any) => shift.shift === "afternoon")?.map((shift: any) => ({
      label: shift.name,
      value: shift.id
   }))
   const eveningShiftOptions: SelectProps['options'] = shiftList && shiftList?.filter((shift: any) => shift.shift === "evening")?.map((shift: any) => ({
      label: shift.name,
      value: shift.id
   }))
   const handleShiftSelected = (value: any) => {
      setShiftSelected(value);
   };
   // 
   const roomOptions: SelectProps['options'] = roomList && roomList?.map((room: any) => ({
      label: room.name,
      value: room.id
   }));
   const handleRoomSelected = (value: any) => {
      setRoomSelected(value);
   };

   // 
   const subjectOptions: SelectProps['options'] = isAdmin
      ? subjectList && subjectList?.map((subject: any) => ({
         label: subject?.name,
         value: subject?.id
      }))
      : teacherSubjectRelation?.map((subject: any) => ({
         label: subject?.name,
         value: subject?.id
      }))
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
      ? classList && classList?.map((cls: any) => ({
         label: cls.name,
         value: cls.id
      }))
      : Array.from(uniqueClassMap.values())?.map((cls: any) => ({
         label: cls?.classes?.name,
         value: cls?.classes?.id
      }))
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
   };

   // Hàm xử lý submit form
   const { loading, querySchedule } = useScheduleQuery({
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
      setScheduleList
   });

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách thời khóa biểu</h1>
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
               onClick={() => querySchedule(false)}
            ><h5>Tìm</h5></Button>
            <Button
               color="primary"
               variant="solid"
               size='large'
               onClick={() => querySchedule(true)}
            ><h5>Tìm tất cả</h5></Button>
         </div>
         <div >
            <Table<TableDataType>
               columns={columns}
               dataSource={scheduleData}
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

export default Schedule;
