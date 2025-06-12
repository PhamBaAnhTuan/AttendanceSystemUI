'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, SelectProps, Select } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import { normalizeString } from '@/utils/normalizeString';

const AddFacultyPage = () => {
   const { token } = useAuth()
   const router = useRouter();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      setLoading(true);
      try {
         const res = await axios.post(API.FACULTY, values, {
            headers: {
               'ngrok-skip-browser-warning': 'true',
               'Authorization': `Bearer ${token}`
            }
         })
         // console.log('Post subject res:', res);
         showMessage('success', 'Thêm khoa thành công!');
         router.replace('/faculty');
      } catch (error: any) {
         const errorData = error?.response?.data;
         if (errorData?.name?.[0] === 'faculty with this name already exists.') {
            showMessage('error', 'Tên khoa đã tồn tại, vui lòng nhập tên khác!');
         }
         console.error('Post Faculty error: ', error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Thêm khoa</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >
            <Form.Item
               label="Tên khoa"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập tên Khoa!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Mô tả"
               name="description"
            >
               <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} className='log-button'>
               <h4>Thêm</h4>
            </Button>
         </Form>
      </div>
   );
};

export default AddFacultyPage;
