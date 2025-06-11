'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Form, Upload, Select, SelectProps, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext'
// utils
import { normalizeString } from '@/utils/normalizeString';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { formatDate } from '@/utils/formatTime';
import { getSubjectList } from '@/services/subjectServices';
// services
import { addUserMethod } from '@/services/teacherServices';

const AddTeacherPage = () => {
   const router = useRouter();
   const { token } = useAuth()
   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   // subject
   const [subjectList, setSubjectList]: any = useState([]);
   const [subjectSelected, setSubjectSelected]: any = useState([]);

   const log = () => {
      console.log(
         '\n Subject list: ', subjectList,
         '\n Subject selected: ', subjectSelected,
      );
   }

   useEffect(() => {
      getSubjectList(token, setSubjectList)
   }, [])
   // 
   const subjectOptions: SelectProps['options'] = subjectList.map((subject: any) => ({
      label: subject.name,
      value: subject.id
   }));
   const handleSubjectSelected = (value: any) => {
      setSubjectSelected(value);
   };

   // Pick picture
   const handleUploadChange = (info: any) => {
      const file = info.file.originFileObj
      return file
   };
   //
   const handleSubmit = (values: any) => addUserMethod(token, setLoading, values, subjectSelected, showMessage, router)

   return (
      <div className="form-container">
         <h2 className='form-title'>Thêm giáo viên</h2>
         <Form
            size='small'
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >

            <Form.Item
               label="Tên giáo viên"
               name="fullname"
               rules={[{ required: true, message: 'Vui lòng nhập Tên giáo viên!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Email"
               name="email"
               rules={[{ required: true, type: 'email', message: 'Vui lòng nhập Email!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Password"
               name="password"
               rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Địa chỉ"
               name="address"
               rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Số điện thoại"
               name="phone_number"
               rules={[{ required: true, message: 'Vui lòng nhập Số điện thoại!' }]}
            >
               <Input allowClear />
            </Form.Item>

            <Form.Item
               label="Ngày sinh"
               name="date_of_birth"
               rules={[{ required: true, type: 'date', message: 'Vui lòng nhập Ngày sinh!' }]}
            >
               <DatePicker format={formatDate} />
            </Form.Item>

            <Form.Item
               label="Môn học"
            >
               <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Chọn môn"
                  value={subjectSelected}
                  onChange={handleSubjectSelected}
                  options={subjectOptions}
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

            <Button type="primary" htmlType="submit" loading={loading} className='log-button'>
               <h4>Thêm</h4>
            </Button>
         </Form>
      </div>
   );
};

export default AddTeacherPage;
