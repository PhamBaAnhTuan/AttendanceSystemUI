'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../student.css';
import { useRouter } from 'next/navigation';
import { Button, Input, Form, message, Alert, Upload } from 'antd';
import { API } from '@/constants/api';

const url = API.STUDENTS

// interface Form {
//    id: number,
//    class_id: string,
//    name: string,
//    email: string,
//    address: string,
//    phone_number: string,
//    avatar: any
// }

const AddStudentPage = () => {
   const router = useRouter();
   const [messageApi, contextHolder] = message.useMessage();

   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const [initialValues, setInitialValues] = useState<any>();

   const [imgFileName, setImgFileName] = useState<string | null>(null);

   const log = () => {
      console.log(
         'Img name: ', imgFileName,
      );
   }
   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      // console.log('Form values:', values);
      setLoading(true);

      // Kiểm tra avatar là File
      if (values.avatar instanceof File) {
         console.log('Avatar file:', values.avatar);
      } else {
         console.warn('Avatar is not a valid file:', values.avatar);
      }

      try {
         const response = await axios.post(url, values);
         console.log('Response:', response.data);
         messageApi.open({
            type: 'success',
            content: 'Add student successfully!',
         });
         router.push(`/student/camera?id=${values.id}&name=${encodeURIComponent(values.name)}`);
      } catch (error: any) {
         const errorData = error?.response?.data;

         // Kiểm tra lỗi cụ thể
         if (errorData?.id?.[0] === 'student with this id already exists.') {
            messageApi.open({
               type: 'error',
               content: 'ID sinh viên đã tồn tại, vui lòng nhập ID khác.',
            });
         } else if (errorData?.class_id?.[0] === 'This field is required.') {
            messageApi.open({
               type: 'error',
               content: 'Vui lòng chọn lớp cho sinh viên.',
            });
         } else if (errorData?.email?.[0] === 'student with this email already exists.') {
            messageApi.open({
               type: 'error',
               content: 'This email address already exists!',
            });
         } else if (errorData?.class_id?.[0] === `Invalid pk "${values.class_id}" - object does not exist.`) {
            messageApi.open({
               type: 'error',
               content: 'Wrong class id, please check again!',
            });
         } else {
            // Lỗi không xác định
            messageApi.open({
               type: 'error',
               content: `Lỗi không xác định: ${JSON.stringify(errorData)}`,
            });
         }

         console.error('Lỗi chi tiết từ server:', errorData);
      } finally {
         setLoading(false);
      }
   };

   // Pick picture
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
   };

   return (
      <div className="form-container">
         {contextHolder}
         <h2 className='form-title'>Thêm Sinh Viên</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
            initialValues={initialValues}
         >
            <Form.Item
               label="ID Sinh Viên"
               name="id"
               rules={[{ required: true, message: 'Vui lòng nhập ID sinh viên!' }]}
            >
               <Input />
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

            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', alignSelf: 'center' }}>
               Thêm Sinh Viên
            </Button>
         </Form>
         <Button style={{ width: '100%' }} onClick={log}>
            Log
         </Button>
      </div>
   );
};

export default AddStudentPage;
