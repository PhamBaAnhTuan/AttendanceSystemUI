'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../student.css';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, message, Alert, Upload } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { postApiAction } from '@/services/mainService';

const AddTeacherPage = () => {
   const dispatch = useAppDispatch()
   const { token } = useAuth()
   const router = useRouter();
   const [messageApi, Notification] = message.useMessage();
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
      // router.push(`/student/camera?id=${values.id}&name=${encodeURIComponent(values.name)}`);
      // console.log('Form values:', values);
      setLoading(true);

      try {
         const formData = new FormData();
         // Thêm các trường dữ liệu vào formData
         formData.append('id', values.id);
         formData.append('name', values.name);
         formData.append('email', values.email);
         formData.append('address', values.address);
         formData.append('phone_number', values.phone_number);

         // Xử lý file ảnh
         if (values.avatar) {
            const originalFile = values.avatar;
            const fileExtension = originalFile.name.split('.').pop(); // Lấy đuôi file
            const newFileName = `Teacher_${values.id}_${values.name}.${fileExtension}`;

            // Tạo file mới với tên đã định dạng
            const renamedFile = new File([originalFile], newFileName, {
               type: originalFile.type
            });

            formData.append('avatar', renamedFile);
         }
         console.log('Form data values:', formData.get('avatar'));
         const response = await dispatch(postApiAction(token, formData, 'teacher'))
         console.log('Post res:', response);
         messageApi.success('Thêm giáo viên thành công!');
         router.push(`/teacher/camera?id=${values.id}&name=${encodeURIComponent(values.name)}`);
      } catch (error: any) {
         const errorData = error?.response?.data;

         // Kiểm tra lỗi cụ thể
         if (errorData?.id?.[0] === 'teacher with this id already exists.') {
            messageApi.error('ID giáo viên đã tồn tại, vui lòng nhập ID khác');
         } else if (errorData?.class_id?.[0] === 'This field is required.') {
            messageApi.error('Vui lòng chọn lớp cho giáo viên');
         } else if (errorData?.email?.[0] === 'teacher with this email already exists.') {
            messageApi.error('Email này đã tồn tại, vui lòng nhập Email khác');
         } else if (errorData?.class_id?.[0] === `Invalid pk "${values.class_id}" - object does not exist.`) {
            messageApi.error('ID lớp không đúng, vui lòng nhập lại');
         } else if (errorData?.phone_number?.[0] === `teacher with this phone number already exists.`) {
            messageApi.error('Số điện thoại đã tồn tại, vui lòng nhập lại');
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

   // Pick picture
   const handleUploadChange = (info: any) => {
      const fileObj = info.fileList[info.fileList.length - 1]?.originFileObj;
      console.log("Info file: ", info);
      console.log("Pick img file: ", fileObj);
      if (fileObj && fileObj instanceof File) {
         setImgFileName(fileObj.name);
         form.setFieldsValue({ avatar: fileObj });
         console.log("File name: ", fileObj.name);
      } else {
         setImgFileName(null);
         form.setFieldsValue({ avatar: undefined });
      }
   };

   return (
      <div className="form-container">
         {Notification}
         <h2 className='form-title'>Thêm giáo viên</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
            initialValues={initialValues}
         >
            <Form.Item
               label="ID giáo Viên"
               name="id"
               rules={[{ required: true, message: 'Vui lòng nhập ID giáo viên!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Tên giáo Viên"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập tên giáo viên!' }]}
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
               label="Địa chỉ thường trú"
               name="address"
               rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Số điện thoại"
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

export default AddTeacherPage;
