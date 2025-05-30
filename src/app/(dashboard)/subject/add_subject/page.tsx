'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
// import '../subject.css';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, message } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';

const AddSubjectPage = () => {
   const { token } = useAuth()
   const router = useRouter();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);

   const log = () => {
      console.log(
         // 'Img name: ', imgFileName,
      );
   }
   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      // console.log('Form values:', values);
      setLoading(true);
      try {
         const response = await axios.post(API.SUBJECTS, values, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         })
         console.log('Post subject res:', response);
         message.success('Thêm môn học thành công!');
         router.replace('/subject');
      } catch (error: any) {
         const errorData = error?.response?.data;
         // Kiểm tra lỗi cụ thể
         if (errorData?.id?.[0] === 'subject with this id already exists.') {
            message.error('ID môn học đã tồn tại, vui lòng nhập ID khác');
         } if (errorData?.name?.[0] === 'subject with this name already exists.') {
            message.error('Tên môn học đã tồn tại, vui lòng nhập tên khác!');
         } else {
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
         <h2 className='form-title'>Thêm môn học</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >
            <Form.Item
               label="ID môn học"
               name="id"
               rules={[{ required: true, message: 'Vui lòng nhập ID môn học!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Tên môn học"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập Tên môn học!' }]}
            >
               <Input />
            </Form.Item>
            <Form.Item
               label="Số tín chỉ"
               name="credit"
               rules={[{ required: true, message: 'Vui lòng nhập Tên số tín chỉ!' }]}
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

export default AddSubjectPage;
