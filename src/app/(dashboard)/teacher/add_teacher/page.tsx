'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../teacher.css';
import { useRouter } from 'next/navigation';
import { API, API_AUTH, API_URL } from '@/constants/api';
import { Button, Input, Form, Upload, Select, SelectProps, DatePicker } from 'antd';
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
import { turnToArray } from '@/utils/turnToArray';

const AddTeacherPage = () => {
   const router = useRouter();
   const { token } = useAuth()
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // subject
   const [subjectList, setSubjectList]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);

   const log = () => {
      console.log(
         '\n Subject list: ', subjectList,
         '\n Subject selected: ', subjectSelected,
      );
   }

   useEffect(() => {
      getSubjectList()
   }, [])

   // 
   const getSubjectList = async () => {
      try {
         const res = await axios.get(`${API.SUBJECTS}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get subject list res:', data);
         setSubjectList(data);
      } catch (error: any) {
         console.error('Failed to fetch subject list:', error?.response?.detail || error?.message);
      }
   }

   // 
   const addTeacherSubject = async (teacherID: number, subjectIDs: number[]) => {
      const subjectID = turnToArray(subjectIDs);
      if (subjectID.length === 0) {
         console.warn('There is no subject ID to add!')
         return;
      } else {
         const subjectsPayload = subjectID.map(subjectId => ({
            teacher_id: teacherID,
            subject_id: subjectId
         }));
         // console.log('Subject payload to add: ', subjectsPayload)
         try {
            await axios.post(
               API.TEACHER_SUBJECT, subjectsPayload,
               { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`➕ Thêm thành công Teacher-Subject!`);
         } catch (error) {
            console.error(`❌ Lỗi thêm Teacher-Subject: `, error);
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

   // Pick picture
   const handleUploadChange = (info: any) => {
      const file = info.file.originFileObj
      return file
   };

   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      setLoading(true);
      try {
         const formData = new FormData();
         const fields = ['fullname', 'email', 'password', 'address', 'phone_number', 'date_of_birth', 'avatar', 'role'];
         fields.forEach(field => {
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
            // console.log(`💥${field}:`, value);
         });

         if (values.avatar) {
            const renamedFile = formatImageNameFile(values.avatar, 'Teacher', values.fullname)
            formData.append('avatar', renamedFile);
         }

         const res = await axios.post(`${API_AUTH.SIGNUP}`, formData);
         const newTeacherID = res.data?.id
         const newRole = res.data?.role.name
         const newTeacherFullname = res.data?.fullname
         if (newTeacherID) {
            await addTeacherSubject(newTeacherID, subjectSelected);
         }
         showMessage('loading', 'Thêm giáo viên thành công!\nChuyển sang trang thêm nhận diện khuôn mặt');
         router.replace(`/teacher/camera?id=${newTeacherID}&role=${newRole}&fullname=${encodeURIComponent(newTeacherFullname)}`);
      } catch (error: any) {
         const errorData = error?.response?.detail;
         // Kiểm tra lỗi cụ thể
         if (errorData?.id?.[0] === 'user with this id already exists.') {
            showMessage('error', 'ID giáo viên đã tồn tại, vui lòng nhập ID khác!');
         } else if (errorData?.email?.[0] === 'user with this email already exists.') {
            showMessage('error', 'Email này đã tồn tại, vui lòng nhập Email khác!');
         } else if (errorData?.phone_number?.[0] === `user with this phone number already exists.`) {
            showMessage('error', 'Số điện thoại đã tồn tại, vui lòng nhập Số điện thoại khác!');
         }
         console.error('Add teacher error: ', error);
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
               label="Tên giáo viên"
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
               rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Địa chỉ"
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
