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

   const log = () => {
      console.log(
         // 'Img name: ', imgFileName,
      );
   }
   useEffect(() => {
      getMajorList()
   }, [])
   // 
   const getMajorList = async () => {
      try {
         const res = await axios.get(`${API.MAJOR}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get Major list res:', data);
         setMajorList(data);
      } catch (error: any) {
         console.error('Failed to fetch Major list:', error?.response?.data || error?.message);
      }
   };
   // major
   const [majorList, setMajorList]: any = useState([]);
   const [majorSelected, setMajorSelected]: any = useState([]);
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
      // console.log('Form values:', values);
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
         const errorData = error?.response?.detail;
         // Kiểm tra lỗi cụ thể
         if (errorData?.id?.[0] === 'class with this id already exists.') {
            showMessage('error', 'ID lớp học đã tồn tại, vui lòng nhập ID khác!');
         }
         if (errorData?.name?.[0] === 'class with this name already exists.') {
            showMessage('error', 'Tên lớp học đã tồn tại, vui lòng nhập tên khác!');
         } else {
            // Lỗi không xác định
            showMessage('error', `Lỗi không xác định: ${JSON.stringify(errorData)}`);
         }
         console.error('Lỗi chi tiết từ server:', errorData);
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
               label="Ngành"
               name="major_id"
               rules={[{ required: true, message: 'Vui lòng chọn ngành!' }]}
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
