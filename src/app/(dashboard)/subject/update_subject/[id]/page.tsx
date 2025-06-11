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

const UpdateSubjectPage = () => {
   const router = useRouter();
   const { token } = useAuth()
   const { id } = useParams();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const [initialValues, setInitialValues]: any = useState({});
   const { showMessage } = useMessageContext()

   useEffect(() => {
      const getSubjectInfo = async () => {
         setLoading(true);
         try {
            const res = await axios.get(`${API.SUBJECTS}${id}/`, {
               headers: {
                  'Authorization': `Bearer ${token}`
               }
            })
            const data = res.data
            const values = {
               id: data?.id,
               name: data?.name,
               credit: data?.credit,
               description: data?.description,
            }
            form.setFieldsValue(values);
            setInitialValues(values)
         } catch (error: any) {
            console.error('Failed to fetch subject:', error?.response?.data || error?.message);
         } finally {
            setLoading(false);
         }
      };

      getSubjectInfo();
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

            // for (const [key, value] of formData.entries()) {
            //    console.log(`💥PUT ${key}:`, value);
            // }
            await axios.put(`${API.SUBJECTS}${id}/`, formData,
               {
                  headers:
                     { Authorization: `Bearer ${token}` }
               }
            );
            showMessage('success', 'Cập nhật thông tin môn học thành công!');
            router.replace('/subject');
         }
      } catch (error) {
         console.error('Update Subject error:', error);
         showMessage('error', 'Cập nhật thất bại');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
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
               rules={[{ required: true, message: 'Vui lòng nhập Tên môn học!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Số tín chỉ"
               name="credit"
               rules={[{ required: true, message: 'Vui lòng nhập Số tín chỉ!' }]}
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

export default UpdateSubjectPage;
