'use client'

import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, message } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import '../../room.css'
import axios from 'axios';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { getChangedFields, isFormChanged } from '@/utils/checkFormChange';
// utils


const UpdateRoomPage = () => {
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
      const getRoomInfo = async () => {
         setLoading(true);
         try {
            const res = await axios.get(`${API.ROOMS}${id}/`, {
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
            // console.log('Initial form values: ', initialValues)
            // console.log('Form values: ', form.getFieldsValue())
         } catch (error: any) {
            console.error('Failed to fetch room:', error?.response?.data || error?.message);
         } finally {
            setLoading(false);
         }
      };

      getRoomInfo();
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
            const res = await axios.patch(`${API.ROOMS}${id}/`, changedField, {
               headers: {
                  'Authorization': `Bearer ${token}`,
               },
            });
            const data = res.data
            console.log('Post room res: ', data);
            message.success('Cập nhật phòng học thành công!');
            router.replace('/room');
         } catch (error: any) {
            const errorData = error.response?.data
            if (errorData?.name?.[0] === 'room with this name already exists.') {
               message.error('Tên phòng học đã tồn tại, vui lòng nhập tên khác!');
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
         <h1 className="form-title">Cập nhật phòng học</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID phòng học"
               name="id"
               rules={[{ required: true, message: 'Vui lòng nhập ID phòng học!' }]}
            >
               <Input disabled />
            </Form.Item>

            <Form.Item
               label="Tên phòng học"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập tên phòng học!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Mô tả"
               name="description"
            >
               <Input />
            </Form.Item>

            <Button htmlType="submit" type="primary" loading={loading} className='log-button'>
               <h4>Cập nhật</h4>
            </Button>
         </Form>
      </div>
   );
};

export default UpdateRoomPage;
