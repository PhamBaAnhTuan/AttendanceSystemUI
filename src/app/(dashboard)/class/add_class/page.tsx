'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../class.css';
import { useRouter } from 'next/navigation';
import { API } from '@/constants/api';
import { Button, Input, Form, Select, SelectProps } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext'
import { normalizeString } from '@/utils/normalizeString';

const AddClassPage = () => {
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
      getFacultyList()
   }, [])
   useEffect(() => {
      getMajorList(facultySelected)
      setMajorSelected(undefined);
      form.setFieldsValue({ major_id: undefined });
   }, [facultySelected])
   // 
   const getFacultyList = async () => {
      setLoading(true);
      try {
         const res = await axios.get(`${API.FACULTY}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Faculty list res:', data);
         setFacultyList(data);
      } catch (error: any) {
         console.error('Failed to fetch Faculty list:', error?.response?.data || error?.message);
      } finally {
         setLoading(false);
      }
   };
   // 
   const getMajorList = async (facultyID: string) => {
      setLoading(true);
      try {
         const res = await axios.get(`${API.MAJOR}?faculty_id=${facultyID}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Major list res:', data);
         setMajorList(data);

      } catch (error: any) {
         console.error('Failed to fetch Major list:', error?.response?.data || error?.message);
      } finally {
         setLoading(false);
      }
   };

   // 
   const facultyOptions: SelectProps['options'] = facultyList.map((faculty: any) => ({
      label: faculty.name,
      value: faculty.id
   }));
   const handleFacultySelected = (value: any) => {
      setFacultySelected(value);
   };
   // 
   const majorOptions: SelectProps['options'] = majorList.map((major: any) => ({
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
         const response = await axios.post(API.CLASSES, values, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         })
         console.log('Post class res:', response);
         showMessage('success', 'Thêm lớp học thành công!');
         router.replace('/class');
      } catch (error: any) {
         const errorData = error?.response?.data;
         if (errorData?.name?.[0] === 'class with this name already exists.') {
            showMessage('error', 'Tên lớp học đã tồn tại, vui lòng nhập tên khác!');
         }
         console.error('Post class error: ', errorData);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Thêm lớp học</h2>
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
               <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} className='log-button'>
               <h4>Thêm</h4>
            </Button>
         </Form>
      </div>
   );
};

export default AddClassPage;
