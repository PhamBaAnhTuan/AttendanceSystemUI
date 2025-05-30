'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../teacher.css';
import { useRouter } from 'next/navigation';
import { API, API_AUTH, API_URL } from '@/constants/api';
import { Button, Input, Form, Alert, Upload, Space, Select, SelectProps, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { useMessageContext } from '@/context/messageContext'
// utils
import { normalizeString } from '@/utils/normalizeString';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';
import { formatImageNameFile } from '@/utils/formatImageNameFile';

const TEACHER_API = API.TEACHERS
const SUBJECT_API = API.SUBJECTS
const TEACHER_SUBJECT_API = API.TEACHER_SUBJECT
const TEACHER_CLASS_API = API.TEACHER_CLASS
const CLASS_API = API.CLASSES

const AddTeacherPage = () => {
   const router = useRouter();
   const { token } = useAuth()
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // subject
   const [subjectList, setSubjectList]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);

   // class
   const [classList, setClassList]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   const log = () => {
      console.log(
         // 'Img name: ', imgFileName,
         '\n Subject list: ', subjectList,
         '\n Subject selected: ', subjectSelected,
         // 
         '\n Class list: ', classList,
         '\n Class selected: ', classSelected,
      );
   }

   useEffect(() => {
      getClassList()
      getSubjectList()
   }, [])

   // 
   const getSubjectList = async () => {
      try {
         const res = await axios.get(`${SUBJECT_API}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get subject list res:', data);
         setSubjectList(data);
      } catch (error: any) {
         console.error('Failed to fetch subject list:', error?.response?.data || error?.message);
      }
   }
   // 
   const getClassList = async () => {
      try {
         const res = await axios.get(`${CLASS_API}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get class list res:', data);
         setClassList(data);
      } catch (error: any) {
         console.error('Failed to fetch class list:', error?.response?.data || error?.message);
      }
   };

   // 
   const addTeacherSubject = async (teacherID: number, subjectIDs: number[]) => {
      // console.log('Teacher ID: ', teacherID)
      // console.log('Subject ID: ', subjectIDs)
      // 
      if (subjectIDs.length === 0) {
         console.warn('There is no subject ID to add!')
      } else {
         const subjectsPayload = subjectIDs.map(subjectId => ({
            teacher_id: teacherID,
            subject_id: subjectId
         }));
         console.log('Subject payload to add: ', subjectsPayload)
         try {
            await axios.post(
               TEACHER_SUBJECT_API, subjectsPayload,
               { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`➕ Thêm thành công Teacher - Subject!`);
         } catch (error) {
            console.error(`❌ Lỗi thêm Teacher - Subject: `, error);
         }
      }
   };
   // 
   const addTeacherClass = async (teacherID: number, classIDs: number[]) => {
      // console.log('Teacher ID: ', teacherID)
      // console.log('Classes ID: ', classIDs)
      // 
      if (classIDs.length === 0) {
         console.warn('There is no class ID to add!')
      } else {
         const classesPayload = classIDs.map(classId => ({
            class_id: classId,
            teacher_id: teacherID
         }));
         console.log('Classes payload to add: ', classesPayload)
         try {
            await axios.post(
               TEACHER_CLASS_API, classesPayload,
               { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`➕ Thêm thành công Teacher - Class!`);
         } catch (error) {
            console.error(`❌ Lỗi thêm Teacher - Class: `, error);
         }
      }
   };

   // 
   const subjectOptions: SelectProps['options'] = subjectList.map((subject: any) => ({
      label: subject.name,
      value: subject.id
   }));
   const handleSubjectSelected = (value: any) => {
      setSubjectSelected(value);
   };
   // 
   const classOptions: SelectProps['options'] = classList.map((cls: any) => ({
      label: cls.name,
      value: cls.id
   }));
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
   };

   // Pick picture
   const handleUploadChange = (info: any) => {
      const file = info.file.originFileObj
      console.log('Img file name: ', file)

      return file
   };

   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      setLoading(true);
      try {
         const formData = new FormData();
         const fields = ['fullname', 'email', 'password', 'address', 'phone_number', 'avatar', 'date_of_birth', 'role'];
         fields.forEach(field => {
            if (values[field]) {
               let value = values[field];

               if (field === 'date_of_birth') {
                  try {
                     value = dayjs(value).format(formatDate);
                  } catch (err) {
                     console.warn('Invalid date_of_birth format:', value);
                  }
               }
               if (field === 'role') {
                  value = 'teacher'
               }
               // 
               formData.append(field, value);
               console.log(`${field}:`, value);
            }
         });
         // console.log('Form data values:', formData);
         if (values.avatar) {
            const renamedFile = formatImageNameFile(values.avatar, 'Teacher', values.fullname)
            formData.append('avatar', renamedFile);
         }

         // const res = await axios.post(`${API_AUTH.SIGNUP}`, formData);
         // console.log('Post res:', res);
         // showMessage('loading', 'Thêm giáo viên thành công!\nChuyển sang trang thêm nhận diện khuôn mặt');

         // const newTeacherId = res.data?.id
         // const newTeacherFullname = res.data?.fullname
         // if (newTeacherId) {
         //    await addTeacherSubject(newTeacherId, subjectSelected);
         //    await addTeacherClass(newTeacherId, classSelected);
         // }
         // 
         // router.replace(`/teacher/camera?id=${newTeacherId}&name=${encodeURIComponent(newTeacherFullname)}`);
         await addTeacherSubject(99, subjectSelected);
         await addTeacherClass(99, classSelected);
      } catch (error: any) {
         const errorData = error?.response?.detail;
         // Kiểm tra lỗi cụ thể
         if (errorData?.id?.[0] === 'user with this id already exists.') {
            showMessage('error', 'ID giáo viên đã tồn tại, vui lòng nhập ID khác');
         } else if (errorData?.class_id?.[0] === 'This field is required.') {
            showMessage('error', 'Vui lòng chọn lớp cho giáo viên');
         } else if (errorData?.email?.[0] === 'user with this email already exists.') {
            showMessage('error', 'Email này đã tồn tại, vui lòng nhập Email khác');
         } else if (errorData?.class_id?.[0] === `Invalid pk "${values.class_id}" - object does not exist.`) {
            showMessage('error', 'ID lớp không đúng, vui lòng nhập lại');
         } else if (errorData?.phone_number?.[0] === `user with this phone number already exists.`) {
            showMessage('error', 'Số điện thoại đã tồn tại, vui lòng nhập lại');
         }
         console.error('Lỗi chi tiết từ server:', error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Thêm giáo viên</h2>
         <Form
            size='small'
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >


            <Form.Item
               label="Tên giáo Viên"
               name="fullname"
               rules={[{ required: true, message: 'Vui lòng nhập Tên giáo viên!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Email"
               name="email"
               rules={[{ required: true, type: 'email', message: 'Vui lòng nhập Email!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Password"
               name="password"
               rules={[{ required: true, message: 'Vui lòng nhập password!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Địa chỉ thường trú"
               name="address"
               rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Số điện thoại"
               name="phone_number"
               rules={[{ required: true, message: 'Vui lòng nhập Số điện thoại!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Ngày sinh"
               name="date_of_birth"
               rules={[{ required: true, type: 'date', message: 'Vui lòng nhập Ngày sinh!' }]}
            >
               <DatePicker format={formatDate} />
            </Form.Item>

            <Form.Item
               label="Môn học"
               name="subject"
            >
               <Select
                  mode="multiple"
                  allowClear
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
               name="class"
            >
               <Select
                  mode="multiple"
                  allowClear
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

            <Form.Item
               label="Ảnh đại diện"
               name="avatar"
               valuePropName="file"
               getValueFromEvent={handleUploadChange}
            >
               <Upload listType="picture-card" maxCount={1} onPreview={() => false}>
                  <button
                     style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }}
                     type="button"
                  >
                     <PlusOutlined />
                     <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                  </button>
               </Upload>
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} className='log-button'>
               <h4>Thêm</h4>
            </Button>
         </Form>
      </div>
   );
};

export default AddTeacherPage;
