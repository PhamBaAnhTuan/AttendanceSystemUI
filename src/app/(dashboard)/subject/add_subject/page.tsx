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
import { getMajorList } from '@/services/majorServices';

const AddSubjectPage = () => {
   const { token } = useAuth()
   const router = useRouter();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // faculty
   const [facultyList, setFacultyList]: any = useState([]);
   const [facultySelected, setFacultySelected]: any = useState([]);
   // major
   const [majorList, setMajorList]: any = useState([]);
   const [majorSelected, setMajorSelected]: any = useState([]);

   useEffect(() => {
      getFacultyList(token, setFacultyList)
   }, [])
   useEffect(() => {
      getMajorList(token, facultySelected, setMajorList)
      setMajorSelected(undefined);
      form.resetFields(['major_id']);
   }, [facultySelected])
   // 
   const facultyOptions: SelectProps['options'] = facultyList?.map((faculty: any) => ({
      label: faculty.name,
      value: faculty.id
   }));
   const handleFacultySelected = (value: any) => {
      setFacultySelected(value);
   };
   // 
   const majorOptions: SelectProps['options'] = majorList?.map((major: any) => ({
      label: major.name,
      value: major.id
   }));
   const handleMajorSelected = (value: any) => {
      setMajorSelected(value);
   };

   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      setLoading(true);
      try {
         const res = await axios.post(API.SUBJECTS, values, {
            headers: {
               'ngrok-skip-browser-warning': 'true',
               'Authorization': `Bearer ${token}`
            }
         })
         // console.log('Post subject res:', res);
         showMessage('success', 'Thêm môn học thành công!');
         router.replace('/subject');
      } catch (error: any) {
         const errorData = error?.response?.data;
         if (errorData?.name?.[0] === 'subject with this name already exists.') {
            showMessage('error', 'Tên môn học đã tồn tại, vui lòng nhập tên khác!');
         } if (errorData?.credit?.[0] === 'A valid integer is required.') {
            showMessage('error', 'Vui lòng nhập Số tín chỉ thành số!');
         }
         console.error('Post Subject error: ', errorData);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Thêm môn học</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >
            <Form.Item
               label="Khoa"
               name='faculty_id'
               rules={[{ required: true, message: 'Vui lòng chọn Khoa!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn khoa"
                  value={facultySelected}
                  onChange={handleFacultySelected}
                  options={facultyOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
            </Form.Item>

            <Form.Item
               label="Ngành"
               name="major_id"
               rules={[{ required: true, message: 'Vui lòng chọn Ngành!' }]}
            >
               <Select
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn ngành"
                  value={majorSelected}
                  onChange={handleMajorSelected}
                  options={majorOptions}
                  filterOption={(input, option) =>
                     normalizeString(option?.label?.toString() || '').includes(
                        normalizeString(input)
                     )
                  }
               />
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
               <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} className='log-button'>
               <h4>Thêm</h4>
            </Button>
         </Form>
      </div>
   );
};

export default AddSubjectPage;
