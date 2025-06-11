'use client'

import React, { useEffect, useState } from 'react';
import { Button, Form, Input } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import { isFormChanged, getChangedFields } from '@/utils/checkFormChange';

const UpdateMajorPage = () => {
   const router = useRouter();
   const { token } = useAuth()
   const { id } = useParams();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const [initialValues, setInitialValues]: any = useState({});
   const { showMessage } = useMessageContext()

   useEffect(() => {
      const getMajorInfo = async () => {
         setLoading(true);
         try {
            const res = await axios.get(`${API.MAJOR}${id}/`, {
               headers: {
                  'Authorization': `Bearer ${token}`
               }
            })
            const data = res.data
            const values = {
               id: data?.id,
               name: data?.name,
               description: data?.description,
            }
            form.setFieldsValue(values);
            setInitialValues(values)
         } catch (error: any) {
            console.error('Failed to fetch major:', error?.response?.data || error?.message);
         } finally {
            setLoading(false);
         }
      };

      getMajorInfo();
   }, [id, form]);


   const onFinish = async (values: any) => {
      const isFormChange = isFormChanged(initialValues, values);
      if (!isFormChange) {
         showMessage('info', 'Không có thay đổi nào!');
         return;
      }
      try {
         if (isFormChange) {
            setLoading(true)
            const changedFields = getChangedFields(initialValues, values);
            const formData = new FormData();

            Object.entries(changedFields).forEach(([key, value]) => {
               formData.append(key, value);
            });
            const res = await axios.put(`${API.MAJOR}${id}/`, formData,
               {
                  headers:
                     { Authorization: `Bearer ${token}` }
               }
            );
            if (res.data) {
               showMessage('success', 'Cập nhật thông tin Ngành học thành công!');
               router.replace('/major')
            }
         }
      } catch (error) {
         console.error('Update Major error:', error);
         showMessage('error', 'Cập nhật thất bại');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h1 className="form-title">Cập nhật Ngành học</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID ngành"
               name="id"
               rules={[{ required: true, message: 'Vui lòng nhập ID ngành!' }]}
            >
               <Input disabled />
            </Form.Item>

            <Form.Item
               label="Tên ngành"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập tên ngành!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Mô tả"
               name="description"
            >
               <Input
                  allowClear
               />
            </Form.Item>

            <Button htmlType="submit" type="primary" loading={loading} className='log-button'>
               <h4>Cập nhật</h4>
            </Button>
         </Form>
      </div>
   );
};

export default UpdateMajorPage;
