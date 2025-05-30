'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../student.css';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, message, Alert, Upload, SelectProps, Space, Select, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
// hooks
import { useAuth } from '@/hooks/useAuth';
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

   // class
   const [classList, setClassList]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   const log = () => {
      console.log(
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
         const res = await axios.get(`${API.CLASSES}`)
         const data = res.data
         console.log('Get class list res:', data);
         setClassList(data);
      } catch (error: any) {
         console.error('Failed to fetch class list:', error?.response?.data || error?.message);
      }
   };
   // 
   const classOptions: SelectProps['options'] = classList.map((cls: any) => ({
      label: cls.name,
      value: cls.id
   }));
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
      form.setFieldValue('class_id', value)
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
         const fields = ['id', 'name', 'email', 'address', 'phone_number', 'class_id', 'date_of_birth', 'avatar'];
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
               // 
               formData.append(field, value);
               console.log(`🛹Append ${field}:`, value);
            }
         });
         // Xử lý file ảnh
         if (values.avatar) {
            const renamedFile = formatImageNameFile(values.avatar, values.class_id, values.fullname)
            formData.append('avatar', renamedFile);
         }
         for (const [k, v] of formData.entries()) {
            console.log(`🧪 Gửi ${k}:`, v);
         }

         const res = await axios.post(`${API.STUDENTS}`, formData, {
            headers: {
               'Authorization': `Bearer ${token}`,
            },
         });
         const data = res.data
         console.log('Post res:', data);
         message.loading('Thêm sinh viên thành công!\nChuyển sang trang thêm nhận diện khuôn mặt');
         if (data.id && data.name && data.class_id) {
            router.replace(`/student/camera?id=${values.id}&name=${encodeURIComponent(values.name)}&class_id=${values.class_id}`);
         }
      } catch (error: any) {
         const errorData = error?.response?.data;

         // Kiểm tra lỗi cụ thể
         if (errorData?.id?.[0] === 'student with this id already exists.') {
            message.error('ID sinh viên đã tồn tại, vui lòng nhập ID khác');
         } else if (errorData?.email?.[0] === 'student with this email already exists.') {
            message.error('Email này đã tồn tại, vui lòng nhập Email khác');
         } else if (errorData?.class_id?.[0] === 'This field is required.') {
            message.error('Vui lòng chọn lớp cho sinh viên');
         } else if (errorData?.phone_number?.[0] === `student with this phone number already exists.`) {
            message.error('Số điện thoại đã tồn tại, vui lòng nhập lại');
         }
         else {
            // Lỗi không xác định
            message.error(`Lỗi không xác định: ${JSON.stringify(errorData)}`);
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
               label="Tên sinh Viên"
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
               label="Lớp học"
               name="class_id"
               rules={[{ required: true, message: 'Vui lòng chọn Lớp học!' }]}
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
         {/* <Button style={{ width: '100%' }} onClick={log}>
            Log
         </Button> */}
      </div>
   );
};

export default AddStudentPage;
