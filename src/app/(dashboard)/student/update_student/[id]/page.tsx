'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, Button, DatePicker, Form, Input, message, Select, SelectProps, Space, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../student.css'
import axios from 'axios';
import { API } from '@/constants/api';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
// services
import { getApiAction } from '@/services/mainService';
// utils
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';
import { normalizeString } from '@/utils/normalizeString';
import { checkIfChangesExist, getChangedFields, isFormChanged } from '@/utils/checkFormChange';
import { formatImageNameFile } from '@/utils/formatImageNameFile';

const UpdateStudentPage = () => {
   const router = useRouter();
   const { token } = useAuth()

   const { id } = useParams();
   const [form] = Form.useForm();
   const [initialValues, setInitialValues]: any = useState({})
   const [loading, setLoading] = useState(false);

   // class
   const [classList, setClassList]: any = useState([]);
   const [classSelected, setClassSelected]: any = useState([]);

   const log = () => {
      console.log(
      );
   }

   useEffect(() => {
      const getStudentInfo = async () => {
         setLoading(true);
         try {
            const res = await axios.get(`${API.STUDENTS}${id}`, {
               headers: {
                  'Authorization': `Bearer ${token}`
               }
            })
            const data = res.data
            console.log('Get student res: ', data);
            // message.success('Get student successfully!');
            const values = {
               id: data?.id,
               name: data?.name,
               class_id: data?.class_id,
               email: data?.email,
               address: data?.address,
               phone_number: data?.phone_number,
               date_of_birth: data?.date_of_birth
                  ? dayjs(data?.date_of_birth, formatDate)
                  : null,
               avatar: data?.avatar
            }
            form.setFieldsValue(values)
            setInitialValues(values)
            setClassSelected(values.class_id)
            console.log('Initial form values: ', initialValues)
            console.log('Form values: ', form.getFieldsValue())
         } catch (error: any) {
            console.error('Failed to fetch students:', error?.response?.data || error?.message);
         } finally {
            setLoading(false);
         }
      };
      // 
      const getClassList = async () => {
         try {
            const res = await axios.get(API.CLASSES)
            const data = res.data
            console.log('Get class list res:', data);
            setClassList(data);
         } catch (error: any) {
            console.error('Failed to fetch class list:', error?.response?.data || error?.message);
         }
      };

      getStudentInfo();
      getClassList()
   }, [id, form]);

   // 
   const classOptions: SelectProps['options'] = classList.map((cls: any) => ({
      label: cls.name,
      value: cls.id
   }));
   const handleClassSelected = (value: any) => {
      setClassSelected(value);
      form.setFieldValue('class_id', value);
   };

   // Pick picture
   const handleUploadChange = (info: any) => {
      const file = info.file.originFileObj
      console.log('Img file name: ', file)

      return file
   };

   const onFinish = async (values: any) => {
      console.log('Initial form values: ', initialValues)
      console.log('Form values: ', form.getFieldsValue())
      console.warn('Class is: ', classSelected)

      if (isFormChanged(initialValues, values)) {
         console.log('Form changing');
         const changedFields = getChangedFields(initialValues, values);
         if (Object.keys(changedFields).length > 0) {
            const formData = new FormData();

            for (const key in changedFields) {
               if (key === 'date_of_birth') {
                  formData.append(key, dayjs(changedFields[key]).format(formatDate));
               } else {
                  formData.append(key, changedFields[key]);
               }
               // Xử lý file ảnh
               if (key === 'avatar') {
                  const renamedFile = formatImageNameFile(values.avatar, values.class_id, values.id, values.name)
                  formData.append('avatar', renamedFile);
               }
            }

            try {
               for (const [key, value] of formData.entries()) {
                  console.log(`🔥${key}:`, value);
               }
               const res = await axios.patch(`${API.STUDENTS}${id}/`, formData)
               console.log('Res post: ', res);
               message.success('Cập nhật sinh viên thành công!');
               router.replace('/student')
            } catch (err) {
               console.error('Update error:', err);
               // message.error('Cập nhật thất bại');
            }
         }
      } else {
         message.info("Không có thay đổi nào!");
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
               label="Ngày sinh"
               name="date_of_birth"
               rules={[{ required: true, type: 'date', message: 'Vui lòng nhập Ngày sinh!' }]}
            >
               <DatePicker format={formatDate} />
            </Form.Item>

            <Form.Item
               label="Lớp học"
               name="class_id"
               rules={[{ required: true, message: 'Vui lòng chọn Lớp học!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn lớp"
                  value={classSelected}
                  defaultValue={classSelected}
                  onChange={handleClassSelected}
                  options={classOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Form.Item
               label="Ảnh đại diện"
               name="avatar"
               valuePropName="file"
               getValueFromEvent={handleUploadChange}
            >
               <Upload listType="picture-card" maxCount={1} onPreview={() => false}>
                  <button
                     style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }}
                     type="button"
                  >
                     <PlusOutlined />
                     <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                  </button>
               </Upload>
            </Form.Item>

            <Button htmlType="submit" type="primary" loading={loading} className='log-button'>
               <h4>Cập nhật</h4>
            </Button>
         </Form>
         {/* <Button style={{ width: '100%' }} onClick={log}>
            LOG
         </Button> */}
      </div>
   );
};

export default UpdateStudentPage;
