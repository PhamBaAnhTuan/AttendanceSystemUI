'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, Select, SelectProps, DatePicker } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import { normalizeString } from '@/utils/normalizeString';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';
// services
import { getTeacherClassRelation, getTeacherList, getTeacherSubjectRelation } from '@/services/teacherServices';
import { getShiftList } from '@/services/shiftServices';
import { getRoomList } from '@/services/roomServices';


const AddSchedulePage = () => {
   const router = useRouter();
   const { token, isAdmin, info } = useAuth()
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // teacher
   const [teacherList, setTeacherList]: any = useState([]);
   const [teacherSelected, setTeacherSelected]: any = useState([]);
   const [teacherSubjectRelation, setTeacherSubjectRelation]: any = useState([]);
   const [teacherClassRelation, setTeacherClassRelation]: any = useState([]);
   // subject
   const [shiftList, setShiftList]: any = useState([]);
   const [shiftSelected, setShiftSelected]: any = useState([]);
   // subject
   const [subjectSelected, setSubjectSelected]: any = useState([]);

   // class
   const [classList, setClassList]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);
   // room
   const [roomList, setRoomList]: any = useState([]);
   const [roomSelected, setRoomSelected]: any = useState([]);

   useEffect(() => {
      getShiftList(token, setShiftList)
      getRoomList(token, setRoomList)
      if (isAdmin) {
         getTeacherList(token, setTeacherList)
      } else {
         if (info) setTeacherSelected(info?.id);
         getTeacherClassRelation(token, teacherSelected, undefined, setTeacherClassRelation);
         form.setFieldValue('teacher_id', info?.id);
         form.setFieldValue('fullname', info?.fullname);
      }
   }, [])
   // 
   useEffect(() => {
      getTeacherSubjectRelation(token, teacherSelected, setTeacherSubjectRelation)
      getTeacherClassRelation(token, teacherSelected, undefined, setTeacherClassRelation)
      // reset form
      setSubjectSelected(undefined)
      form.resetFields(['subject_id'])
      setClassSelected(undefined)
      form.resetFields(['class_id'])
   }, [teacherSelected])
   // 
   useEffect(() => {
      setClassSelected(undefined)
      form.resetFields(['class_id']);

      if (subjectSelected?.length > 0 || []) {
         const matchSubject = teacherClassRelation.filter((obj: any) => {
            return obj.subject?.id === subjectSelected
         })
         const classFiltered = matchSubject.map((cls: any) => cls?.classes);
         setClassList(classFiltered);
      }
   }, [subjectSelected])
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
         const errorData = error?.response?.data;
         if (errorData?.non_field_errors?.[0] === 'The fields date, period_id, room_id must make a unique set.') {
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
         {/* <Button onClick={log}>
            <h4>LOG</h4>
         </Button> */}
      </div>
   );
};

export default AddSchedulePage;
