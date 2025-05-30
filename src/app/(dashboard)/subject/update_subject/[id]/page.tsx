'use client'

import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, message } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import '../../subject.css'
import axios from 'axios';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
// utils
import { isFormChanged, getChangedFields } from '@/utils/checkFormChange';

const UpdateSubjectPage = () => {
   const router = useRouter();
   const { token } = useAuth()
   const { id } = useParams();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const [initialValues, setInitialValues]: any = useState({});

   const log = () => {
      console.log(
         // 'Img name: ', imgFileName,
      );
   }

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
            console.log('Initial form values: ', initialValues)
            console.log('Form values: ', form.getFieldsValue())
         } catch (error: any) {
            console.error('Failed to fetch subject:', error?.response?.data || error?.message);
         } finally {
            setLoading(false);
         }
      };

      getSubjectInfo();
   }, [id, form]);


   const onFinish = async (values: any) => {
      // console.log('Initial form values: ', initialValues)
      // console.log('Form values: ', form.getFieldsValue())
      // const isChanged = isFormChanged(initialValues, values)
      // console.log('is form changed: ', isChanged)
      if (isFormChanged(initialValues, values)) {
         const changedField = getChangedFields(initialValues, values)
         // console.log('Some thing changed: ', changedField)
         setLoading(true);
         try {
            const res = await axios.patch(`${API.SUBJECTS}${id}/`, changedField, {
               headers: {
                  'Authorization': `Bearer ${token}`,
               },
            });
            const data = res.data
            console.log('Post subject res: ', data);
            message.success('Cập nhật môn học thành công!');
            router.replace('/subject');
         } catch (error: any) {
            const errorData = error.response?.data
            if (errorData?.name?.[0] === 'subject with this name already exists.') {
               message.error('Tên môn học đã tồn tại, vui lòng nhập tên khác!');
            }
            console.error('Lỗi chi tiết từ server:', error.response?.data);
         } finally {
            setLoading(false);
         }
      } else {
         message.info('Không có thay đổi nào!')
         // console.warn('Nothing changed!')
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
