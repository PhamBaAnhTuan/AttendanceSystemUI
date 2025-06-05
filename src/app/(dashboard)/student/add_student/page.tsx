'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
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

const AddStudentPage = () => {
   const router = useRouter();
   const { token } = useAuth()
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // subject
   const [classList, setClassList]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   const log = () => {
      console.log(
         // 'Img name: ', imgFileName,
         '\n Class list: ', classList,
         '\n Class selected: ', classSelected,
      );
   }

   useEffect(() => {
      getClassList()
   }, [])

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
         console.error('Failed to fetch Class list:', error?.response?.detail || error?.message);
      }
   }

   // 
   const addStudentClass = async (studentID: number, classID: number[]) => {
      // console.log('Teacher ID: ', teacherID)
      // console.log('Class ID: ', classID)
      const payload = {
         student_id: studentID,
         class_id: classID
      }
      try {
         await axios.post(
            API.STUDENT_CLASS, payload,
            { headers: { Authorization: `Bearer ${token}` } }
         );
         console.log(`➕ Thêm thành công Student-Class!`);
      } catch (error) {
         console.error(`❌ Lỗi thêm Student-Class: `, error);
      }
   }

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
               value = 'student'
            }
            // 
            formData.append(field, value);
            console.log(`💥${field}:`, value);
         });

         if (values.avatar) {
            const renamedFile = formatImageNameFile(values.avatar, 'Student', values.fullname)
            formData.append('avatar', renamedFile);
         }

         const res = await axios.post(`${API_AUTH.SIGNUP}`, formData);
         const newStudentID = res.data?.id
         const newRole = res.data?.role.name
         const newStudentFullname = res.data?.fullname
         if (newStudentID) {
            await addStudentClass(newStudentID, classSelected);
         }
         showMessage('loading', 'Thêm sinh viên thành công!\nChuyển sang trang thêm nhận diện khuôn mặt');
         router.replace(`/teacher/camera?id=${newStudentID}&role=${newRole}&fullname=${encodeURIComponent(newStudentFullname)}`);
         // await addTeacherSubject(99, subjectSelected);
      } catch (error: any) {
         const errorData = error?.response?.data?.detail;
         // Kiểm tra lỗi cụ thể
         if (errorData === 'Email already exists!') {
            showMessage('error', 'Email này đã tồn tại, vui lòng nhập Email khác!');
         } else if (errorData === "Phone number already exists!") {
            showMessage('error', 'Số điện thoại đã tồn tại, vui lòng nhập Số điện thoại khác!');
         } else if (errorData?.class_id?.[0] === `“[]” is not a valid UUID.`) {
            showMessage('error', 'Vui lòng nhập Lớp cho sinh viên!');
         }
         console.error('Lỗi chi tiết từ server:', errorData);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Thêm sinh viên</h2>
         <Form
            size='small'
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >

            <Form.Item
               label="Tên sinh viên"
               name="fullname"
               rules={[{ required: true, message: 'Vui lòng nhập Tên sinh viên!' }]}
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
               label="Lớp học"
               name="class_id"
               rules={[{ required: true, message: 'Vui lòng chọn Lớp học!' }]}
            >
               <Select
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

export default AddStudentPage;
