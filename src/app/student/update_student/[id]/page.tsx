'use client'

import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, message, Upload } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import '../../student.css'
import axios from 'axios';
import { get } from 'http';
import { API } from '@/constants/api';

const url = API.STUDENTS

const UpdateStudentPage = () => {
   const { id } = useParams();
   const router = useRouter();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);

   const log = () => {
      console.log(
         'Img name: ', imgFileName,
      );
   }

   // Pick picture
   const [imgFileName, setImgFileName] = useState<string | null>(null);
   const handleUploadChange = (info: any) => {
      const fileObj = info.fileList[info.fileList.length - 1]?.originFileObj;
      // console.log("Pick img file: ", fileObj);
      if (fileObj) {
         setImgFileName(fileObj.name);
         form.setFieldsValue({ avatar: fileObj });
      } else {
         setImgFileName(null);
         form.setFieldsValue({ avatar: undefined });
      }
      console.log("Pick img file: ", fileObj);
   };

   useEffect(() => {
      const getUserInfo = async () => {
         setLoading(true);
         try {
            const response = await axios.get(`${url}${id}/`);
            console.log('Response:', response?.data);
            const data = response?.data;
            form.setFieldsValue({
               id: data?.id,
               name: data?.name,
               class_id: data?.class_id,
               email: data?.email,
               address: data?.address,
               phone_number: data?.phone_number,
            });
            if (data?.avatar) {
               const parts = data.avatar.split('/');
               const filename = parts[parts.length - 1];
               setImgFileName(filename);
            }
         } catch (error: any) {
            const errorData = error?.response?.data;
            console.error('Lỗi chi tiết từ server:', errorData);
         } finally {
            setLoading(false);
         }
      };

      getUserInfo();
   }, [id, form]);

   const [messageApi, contextHolder] = message.useMessage();
   const onFinish = async (values: any) => {
      console.log('Form values:', values);
      setLoading(true);

      const formData = new FormData();
      const fields = ['id', 'name', 'email', 'class_id', 'address', 'phone_number'];
      fields.forEach(field => {
         if (values[field]) {
            formData.append(field, values[field]);
         }
      });

      // Kiểm tra avatar là File
      if (values.avatar instanceof File) {
         formData.append('avatar', values.avatar);
         console.log('Avatar file:', values.avatar);
      } else {
         console.warn('Avatar is not a valid file:', values.avatar);
      }

      try {
         const response = await axios.patch(`${url}${values.id}/`, formData);
         console.log('Response:', response.data);
         messageApi.open({
            type: 'success',
            content: 'Add student successfully!',
         });
         router.replace('/student');
      } catch (error: any) {
         console.error('Lỗi chi tiết từ server:', error.response?.data);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h1 className="form-title">Cập nhật sinh viên</h1>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
         >
            <Form.Item
               label="ID Sinh Viên"
               name="id"
               rules={[{ required: true, message: 'Vui lòng nhập ID sinh viên!' }]}
            >
               <Input disabled />
            </Form.Item>

            <Form.Item
               label="Tên Sinh Viên"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập tên sinh viên!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Email"
               name="email"
               rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Class ID"
               name="class_id"
               rules={[{ required: true, message: 'Vui lòng nhập Class ID!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Dia chi"
               name="address"
               rules={[{ required: true, message: 'Vui lòng nhập Dia chi!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Phone number"
               name="phone_number"
               rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Ảnh đại diện"
               name="avatar"
               valuePropName="file"
            >
               <Upload
                  name="avatar"
                  listType="picture"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleUploadChange}
               >
                  <Button >Chọn ảnh</Button>
               </Upload>
               {imgFileName && <Alert message={`Đã chọn: ${imgFileName}`} type="success" showIcon style={{ marginTop: '10px' }} />}
            </Form.Item>

            <Button htmlType="submit" type="primary" loading={loading} style={{ width: '100%' }}>
               Cập nhật
            </Button>
         </Form>
         <Button style={{ width: '100%' }} onClick={log}>
            LOG
         </Button>
      </div>
   );
};

export default UpdateStudentPage;
