'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
// import '../schedule.css';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, Select, SelectProps, DatePicker, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { useMessageContext } from '@/context/messageContext';
// utils
import { normalizeString } from '@/utils/normalizeString';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';
import { formatImageNameFile } from '@/utils/formatImageNameFile';
// 
import type { CheckboxOptionType, GetProp } from 'antd';


const AddSchedulePage = () => {
   const router = useRouter();
   const { token, isAdmin, info } = useAuth()
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // teacher
   const [teacherList, setTeacherList]: any = useState([]);
   const [teacherSelected, setTeacherSelected]: any = useState([]);
   // subject
   const [shiftList, setShiftList]: any = useState([]);
   const [shiftSelected, setShiftSelected]: any = useState([]);
   // subject
   const [teacherSubjectRelation, setTeacherSubjectRelation]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);

   const [teacherClassSubjectList, setTeacherClassSubjectList]: any = useState([]);
   // class
   const [classList, setClassList]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);
   // room
   const [roomList, setRoomList]: any = useState([]);
   const [roomSelected, setRoomSelected]: any = useState([]);

   const log = () => {
      console.log(
         '🔥 Is Admin: ', isAdmin,
         '\n🔥 Info: ', info,

         '\n\n Teacher list: ', teacherList,
         '\n Teacher selected: ', teacherSelected,

         '\n\n Shift list: ', shiftList,
         '\n Shift selected: ', shiftSelected,
         // 
         '\n\n Room list: ', roomList,
         '\n Room selected: ', roomSelected,
         // 
         '\n\n Teacher-Class-Subject list: ', teacherClassSubjectList,
         '\n Class selected: ', classSelected,
         '\n Subject selected: ', subjectSelected,
      );
   }

   useEffect(() => {
      getPeriodList()
      getRoomList()
      if (isAdmin) {
         getTeacherList()
      } else {
         // Nếu không phải admin, lấy danh sách giáo viên từ thông tin người dùng
         setTeacherSelected(info?.id);
         getTeacherClassSubjectList(info?.id);
         form.setFieldValue('teacher_id', info?.id);
         form.setFieldValue('fullname', info?.fullname);
      }
   }, [])
   useEffect(() => {
      if (teacherSelected.length > 0) {
         getTeacherSubjectRelation(teacherSelected);
         setSubjectSelected(undefined)
         setClassSelected(undefined)
      }
   }, [teacherSelected])
   useEffect(() => {
      setClassSelected(undefined)
      form.resetFields(['class_id']);
      if (subjectSelected?.length > 0 || []) {
         const classes = teacherClassSubjectList.filter((obj: any) => {
            return obj?.subject?.id === subjectSelected
         })
         const classFiltered = classes.map((cls: any) => cls?.classes);
         console.log('Classes for selected subject:', classFiltered);
         setClassList(classFiltered);
      }
   }, [subjectSelected])

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
   const getTeacherSubjectRelation = async (teacherID: string | undefined) => {
      try {
         const res = await axios.get(`${API.TEACHER_SUBJECT}?teacher_id=${teacherID}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Teacher-Subject list res:', data);
         const subjectObj = data.map((item: any) => item.subject);
         setTeacherSubjectRelation(subjectObj);
      } catch (error: any) {
         console.error('Failed to fetch Teacher-Subject list:', error?.response?.data || error?.message);
      }
   }
   // 
   const getTeacherClassSubjectList = async (teacherID: string | undefined) => {
      try {
         const res = await axios.get(`${API.TEACHER_CLASS_SUBJECT}?teacher_id=${teacherID}`, {
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
   const teacherOptions: SelectProps['options'] = teacherList.map((teacher: any) => ({
      label: teacher.fullname,
      value: teacher.id
   }));
   const handleTeacherSelected = (value: any) => {
      setTeacherSelected(value);
   };
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
   // const uniqueSubjectMap = new Map<string, any>();
   // teacherClassSubjectList.forEach((subject: any) => {
   //    const subjectName = subject?.subject?.name;
   //    if (!uniqueSubjectMap.has(subjectName)) {
   //       uniqueSubjectMap.set(subjectName, subject);
   //       console.log('Subject mapping:', subject);
   //       console.log('Unique subject added:', uniqueSubjectMap);
   //    }
   // });
   const subjectOptions: SelectProps['options'] = Array.from(teacherSubjectRelation.values()).map((subject: any) => ({
      label: subject?.name,
      value: subject?.id
   }));
   const handleSubjectSelected = (value: any) => {
      setSubjectSelected(value);
   };
   // 
   const classOptions: SelectProps['options'] = Array.from(classList.values()).map((cls: any) => ({
      label: cls?.name,
      value: cls?.id
   }));
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
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
   const handleSubmit = async (values: any) => {
      log()
      // console.log('Form values: ', values)
      setLoading(true);
      try {
         const formData = new FormData();
         const fields = ['date', 'teacher_id', 'period_id', 'room_id', 'class_id', 'subject_id'];
         fields.forEach((field, index) => {
            if (values[field]) {
               let value = values[field];

               if (field === 'date') {
                  try {
                     value = dayjs(value).format(formatDate);
                  } catch (err) {
                     console.warn('Invalid date format:', value);
                  }
               }
               // 
               formData.append(field, value);
               console.log(`${index + 1}. ${field}:`, value);
            }
         });
         const res = await axios.post(`${API.SCHEDULE}`, formData, {
            headers: {
               'Authorization': `Bearer ${token}`,
            },
         });
         console.log('Post schedule res:', res);
         showMessage('success', 'Đặt thời khóa biểu thành công!');
         router.replace(`/`);
      } catch (error: any) {
         const errorData = error?.response?.data?.detail;
         if (errorData?.non_field_errors?.[0] === 'The fields date, room_id, period_id must make a unique set.') {
            showMessage('error', `Ca ${shiftSelected} trong ngày ${dayjs(values.date).format(formatDate)} đã được đặt trước, vui lòng chọn ca khác!`)
         } else if (errorData === 'You do not have permission to perform this action.') {
            showMessage('error', 'Bạn không có quyền thực hiện hành động này!');
         }
         console.error('Lỗi chi tiết từ server:', errorData);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Đặt thời khóa biểu</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >
            <Form.Item
               label="Ngày học"
               name="date"
               rules={[{ required: true, type: 'date', message: 'Vui lòng nhập Ngày học!' }]}
            >
               <DatePicker format={formatDate} />
            </Form.Item>

            {isAdmin && <Form.Item
               label="Giáo viên"
               name="teacher_id"
               rules={[{ required: true, message: 'Vui lòng nhập Giáo viên!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn giáo viên"
                  value={teacherSelected}
                  onChange={handleTeacherSelected}
                  options={teacherOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>}
            {!isAdmin && <Form.Item
               label="ID Giáo Viên"
               name="teacher_id"
            >
               <Input disabled />
            </Form.Item>}

            {!isAdmin && <Form.Item
               label="Tên Giáo Viên"
               name="fullname"
            >
               <Input disabled />
            </Form.Item>}

            <Form.Item
               label="Ca học"
               name="period_id"
               rules={[{ required: true, message: 'Vui lòng nhập Ca học!' }]}
            >
               <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn ca"
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
            </Form.Item>

            <Form.Item
               label="Phòng học"
               name="room_id"
               rules={[{ required: true, message: 'Vui lòng nhập Phòng học!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn phòng"
                  value={roomSelected}
                  onChange={handleRoomSelected}
                  options={roomOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Form.Item
               label="Môn học"
               name="subject_id"
               rules={[{ required: true, message: 'Vui lòng nhập Môn học!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn môn"
                  value={subjectSelected}
                  onChange={handleSubjectSelected}
                  options={subjectOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Form.Item
               label="Lớp học"
               name="class_id"
               rules={[{ required: true, message: 'Vui lòng nhập Lớp học!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn lớp"
                  value={classSelected}
                  onChange={handleClassSelected}
                  options={classOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Button type="primary" htmlType="submit"
               loading={loading}
               className='log-button'
            >
               <h4>Thêm</h4>
            </Button>
         </Form>
         <Button onClick={log}>
            <h4>LOG</h4>
         </Button>
      </div>
   );
};

export default AddSchedulePage;
