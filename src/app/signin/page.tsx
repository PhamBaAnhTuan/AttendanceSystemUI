'use client'

import React, { useEffect, useState } from 'react';
import { API_AUTH } from '@/constants/api';
// router
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
// components
import { Button, Input, Form, message, Alert } from 'antd';
import TextArea from 'antd/es/input/TextArea';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { useMessageContext } from '@/context/messageContext';
// services
import { getUserInfo, signinSuccess, signout } from '@/store/authSlice'
import axios from 'axios';
import { fetchUserInfo } from '@/services/teacherServices';

const SignInPage = () => {
   const dispatch = useAppDispatch()
   const { isAuthenticated, info, token } = useAuth()
   const { showMessage } = useMessageContext()

   const [form] = Form.useForm();
   const [loading, setLoading] = useState(false)

   const log = () => {
      console.log(
         'Is authenticated: ', isAuthenticated,
         '\n Loading: ', loading,
         '\n User: ', info,
         '\n Token: ', token,
      );
   }

   // 
   const handleSubmit = async (values: any) => {
      setLoading(true)
      try {
         const response = await axios.post(API_AUTH.SIGNIN, values)
         const data = response.data
         showMessage('success', 'Đăng nhập thành công!');
         dispatch(signinSuccess(data))
         if (data) {
            fetchUserInfo(data?.access_token, dispatch, getUserInfo)
         }
      } catch (error: any) {
         const errorMsg = error?.response?.data?.detail;
         if (errorMsg === "Invalid credentials!") {
            showMessage('error', "Thông tin đăng nhập không hợp lệ!");
         }
         console.log(`Sign in error: `, errorMsg);
      } finally {
         setLoading(false)
      }
   };

   return (
      <div className="form-container">
         <h2 className='form-title'>Hệ thống quản lý điểm danh sinh viên</h2>
         <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={handleSubmit}
         >
            <Form.Item
               label="Email"
               name="username"
               rules={[{ required: true, type: 'email', message: 'Vui lòng nhập Email!' }]}
            >
               <Input />
            </Form.Item>

            <Form.Item
               label="Password"
               name="password"
               rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
            >
               <Input.Password />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} className='log-button'>
               <h4>ĐĂNG NHẬP</h4>
            </Button>
         </Form>
         {/* <button style={{ height: '8vh', width: '30%', alignSelf: 'center' }} onClick={log}>
            LOG
         </button> */}
      </div>
   );
};

export default SignInPage;
