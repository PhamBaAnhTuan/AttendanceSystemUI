'use client'
import axios from 'axios';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';



const AddRoomPage = () => {
   const { token } = useAuth()
   const router = useRouter();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      // console.log('Form values:', values);
      setLoading(true);
      try {
         const response = await axios.post(API.ROOMS, values, {
            headers: {
               'ngrok-skip-browser-warning': 'true',
               'Authorization': `Bearer ${token}`
            }
         })
         // console.log('Post room res:', response);
         showMessage('success', 'Thêm phòng học thành công!');
         router.replace('/room');
      } catch (error: any) {
         const errorData = error?.response?.data;

         if (errorData?.name?.[0] === 'room with this name already exists.') {
            showMessage('error', 'Tên phòng học đã tồn tại, vui lòng nhập tên khác!');
         }
         console.error('Lỗi chi tiết từ server: ', errorData);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Thêm phòng học</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >
            <Form.Item
               label="Tên phòng học"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập Tên phòng học!' }]}
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

export default AddRoomPage;
