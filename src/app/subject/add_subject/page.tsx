'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../subject.css';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, message, Alert, Upload } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { postApiAction } from '@/services/mainService';


const AddSubjectPage = () => {
   const dispatch = useAppDispatch()
   const { token } = useAuth()
   const router = useRouter();
   const [messageApi, Notification] = message.useMessage();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const [initialValues, setInitialValues] = useState<any>();

   const log = () => {
      console.log(
         // 'Img name: ', imgFileName,
      );
   }
   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      // router.push(`/student/camera?id=${values.id}&name=${encodeURIComponent(values.name)}`);
      // console.log('Form values:', values);
      setLoading(true);

      try {
         const response = await dispatch(postApiAction(token, values, 'subject'))
         console.log('Post res:', response);
         messageApi.success('Thêm môn học thành công!');
         router.replace('/subject');
      } catch (error: any) {
         const errorData = error?.response?.data;

         // Kiểm tra lỗi cụ thể
         if (errorData?.id?.[0] === 'student with this id already exists.') {
            messageApi.error('ID sinh viên đã tồn tại, vui lòng nhập ID khác');
         } else if (errorData?.class_id?.[0] === 'This field is required.') {
            messageApi.error('Vui lòng chọn lớp cho sinh viên');
         } else if (errorData?.email?.[0] === 'student with this email already exists.') {
            messageApi.error('Email này đã tồn tại, vui lòng nhập Email khác');
         } else if (errorData?.class_id?.[0] === `Invalid pk "${values.class_id}" - object does not exist.`) {
            messageApi.error('ID lớp không đúng, vui lòng nhập lại');
         } else if (errorData?.phone_number?.[0] === `student with this phone number already exists.`) {
            messageApi.success('SDT không đúng, vui lòng nhập lại');
         }
         else {
            // Lỗi không xác định
            messageApi.error(`Lỗi không xác định: ${JSON.stringify(errorData)}`);
         }

         console.error('Lỗi chi tiết từ server:', errorData);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         {Notification}
         <h2 className='form-title'>Thêm môn học</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
            initialValues={initialValues}
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
               rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
            >
               <Input />
            </Form.Item>
            <Form.Item
               label="Số tín chỉ"
               name="credit"
               rules={[{ required: true, message: 'Vui lòng nhập tên số tín chỉ!' }]}
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
               Thêm
            </Button>
         </Form>
         {/* <Button style={{ width: '100%' }} onClick={log}>
            Log
         </Button> */}
      </div>
   );
};

export default AddSubjectPage;
