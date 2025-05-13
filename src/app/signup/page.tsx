'use client'

import React, { useEffect, useState } from 'react';
import '../student/student.css';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Input, Form, message } from 'antd';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
// services
import { authAction } from '@/services/authService';
import Link from 'next/link';


const SignUpPage = () => {
   const dispatch = useAppDispatch()
   const { isAuthenticated, user, token, error, loading } = useAuth()
   const [messageApi, Notification] = message.useMessage();

   const [form] = Form.useForm();
   const [initialValues, setInitialValues] = useState<any>();

   const log = () => {
      console.log(
         'Is authenticated: ', isAuthenticated,
         '\n User: ', user,
         '\n Token: ', token,
         '\n Error: ', error,
         '\n Loading: ', loading,
         '\n Path name: ', pathname,
      );
   }

   const pathname = usePathname();
   // Hàm xử lý submit form
   const handleSubmit = async (values: any) => {
      // console.log('Form values: ', values);
      // console.log('Path name: ', pathname);
      dispatch(authAction(values, messageApi, 'signup'))
   };

   return (
      <div className="form-container">
         {Notification}
         <h2 className='form-title'>Sign Up</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
            initialValues={initialValues}
         >
            <Form.Item
               label="Username"
               name="username"
               rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Password"
               name="password"
               rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
            >
               <Input />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} className='log-button'>
               Sign Up
            </Button>
         </Form>
         <h4 className='link'>
            <Link href="./signin" className='link'>
               Đăng nhập
            </Link>
         </h4>
         <button style={{ height: '8vh', width: '30%', alignSelf: 'center' }} onClick={log}>
            LOG
         </button>
      </div>
   );
};

export default SignUpPage;
