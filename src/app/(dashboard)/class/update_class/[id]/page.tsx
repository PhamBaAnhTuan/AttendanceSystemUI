'use client'

import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext'
// utils
import { isFormChanged, getChangedFields } from '@/utils/checkFormChange';
// types
import { EntityType } from '@/types/types';

const UpdateClassPage = () => {
   const router = useRouter();
   const { token } = useAuth()
   const { id } = useParams();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const [initialValues, setInitialValues]: any = useState({});
   const { showMessage } = useMessageContext()

   const log = () => {
      console.log(
         // 'Img name: ', imgFileName,
      );
   }

   useEffect(() => {
      const getClassInfo = async () => {
         setLoading(true);
         try {
            const res = await axios.get(`${API.CLASSES}${id}/`, {
               headers: {
                  'ngrok-skip-browser-warning': 'true',
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
            console.error('Failed to fetch class:', error?.response?.data || error?.message);
         } finally {
            setLoading(false);
         }
      };

      getClassInfo();
   }, [id, form]);


   const onFinish = async (values: any) => {
      const isFormChange = isFormChanged(initialValues, values);
      if (!isFormChange) {
         showMessage('info', 'Không có thay đổi nào!');
         return;
      }
      try {
         if (isFormChange) {
            const changedFields = getChangedFields(initialValues, values)
            setLoading(true);
            const formData = new FormData();

            Object.entries(changedFields).forEach(([key, value]) => {
               formData.append(key, value);
            });

            // for (const [key, value] of formData.entries()) {
            //    console.log(`💥PUT ${key}:`, value);
            // }

            const res = await axios.put(`${API.CLASSES}${id}/`, formData, {
               headers: {
                  'ngrok-skip-browser-warning': 'true',
                  'Authorization': `Bearer ${token}`,
               },
            });
            const data = res.data
            console.log('Post class res: ', data);
            showMessage('success', 'Cập nhật lớp học thành công!');
            router.replace('/class');
         };
      } catch (error: any) {
         const errorData = error.response?.data
         if (errorData?.name?.[0] === 'class with this name already exists.') {
            showMessage('error', 'Tên lớp học đã tồn tại, vui lòng nhập tên khác!');
         }
         console.error('Update Class error: ', errorData);
      } finally {
         setLoading(false);
      }
   }
   return (
      <div className="form-container">
         <h1 className="form-title">Cập nhật lớp học</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID lớp học"
               name="id"
               rules={[{ required: true, message: 'Vui lòng nhập ID lớp học!' }]}
            >
               <Input disabled />
            </Form.Item>

            <Form.Item
               label="Tên lớp học"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập Tên lớp học!' }]}
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

export default UpdateClassPage;
