'use client'

import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, message, Upload } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import '../../subject.css'
import axios from 'axios';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
// services
import { getApiAction } from '@/services/mainService';

const url = API.SUBJECTS

const UpdateSubjectPage = () => {
   const dispatch = useAppDispatch()
   const { token } = useAuth()
   const { id } = useParams();
   const router = useRouter();
   const [messageApi, contextHolder] = message.useMessage();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);

   const log = () => {
      console.log(
         // 'Img name: ', imgFileName,
      );
   }

   useEffect(() => {
      const getSubjectInfo = async () => {
         setLoading(true);
         try {
            const response = await dispatch(getApiAction(token, id, 'subject'))
            console.log('Response:', response);
            messageApi.success('Lấy thông tin môn học thành công!');
            form.setFieldsValue({
               id: response?.id,
               name: response?.name,
               credit: response?.credit,
               description: response?.description,
            });
         } catch (error: any) {
            console.error('Failed to fetch subject:', error?.response?.data || error?.message);
            messageApi.error('Lấy thông tin môn học thành công!');
         } finally {
            setLoading(false);
         }
      };

      getSubjectInfo();
   }, [id, form]);


   const onFinish = async (values: any) => {
      console.log('Form values:', values);
      setLoading(true);
      try {
         const response = await axios.patch(`${url}${values.id}/`, values, {
            headers: {
               'Authorization': `Bearer ${token}`,
            },
         });
         console.log('Response:', response.data);
         messageApi.success('Cập nhật môn học thành công!');
         router.replace('/subject');
      } catch (error: any) {
         console.error('Lỗi chi tiết từ server:', error.response?.data);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         {contextHolder}
         <h1 className="form-title">Cập nhật môn học</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID môn học"
               name="id"
               rules={[{ required: true, message: 'Vui lòng nhập ID môn học!' }]}
            >
               <Input disabled />
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
               rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Mô tả"
               name="description"
            >
               <Input multiple />
            </Form.Item>

            <Button htmlType="submit" type="primary" loading={loading} className='log-button'>
               Cập nhật
            </Button>
         </Form>
         {/* <Button style={{ width: '100%' }} onClick={log}>
            LOG
         </Button> */}
      </div>
   );
};

export default UpdateSubjectPage;
