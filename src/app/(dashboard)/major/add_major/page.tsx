'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, SelectProps, Select } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import { normalizeString } from '@/utils/normalizeString';
// services
import { getFacultyList } from '@/services/facultyServices';

const AddMajorPage = () => {
   const { token } = useAuth()
   const router = useRouter();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   const [facultyList, setFacultyList]: any = useState([]);
   const [facultySelected, setFacultySelected]: any = useState([]);
   useEffect(() => {
      getFacultyList(token, setFacultyList)
   })
   // 
   const facultyOptions: SelectProps['options'] = facultyList?.map((faculty: any) => ({
      label: faculty.name,
      value: faculty.id
   }));
   const handleFacultySelected = (value: string[]) => {
      setFacultySelected(value);
   };
   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      // console.log('Faculty id: ', values)
      setLoading(true);
      try {
         const res = await axios.post(API.MAJOR, values, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         })
         // console.log('Post subject res:', res);
         showMessage('success', 'Thêm ngành học thành công!');
         router.replace('/major');
      } catch (error: any) {
         const errorData = error?.response?.data;
         if (errorData?.name?.[0] === 'major with this name already exists.') {
            showMessage('error', 'Tên ngành học đã tồn tại, vui lòng nhập tên khác!');
         }
         console.error('Post Major error: ', error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Thêm ngành học</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >
            <Form.Item
               label="Khoa"
               name="faculty_id"
               rules={[{ required: true, message: 'Vui lòng nhập tên Khoa!' }]}
            >
               <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn khoa"
                  options={facultyOptions}
                  onChange={handleFacultySelected}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Form.Item
               label="Tên ngành"
               name="name"
               rules={[{ required: true, message: 'Vui lòng nhập tên Ngành!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Mô tả"
               name="description"
            >
               <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} className='log-button'>
               <h4>Thêm</h4>
            </Button>
         </Form>
      </div>
   );
};

export default AddMajorPage;
