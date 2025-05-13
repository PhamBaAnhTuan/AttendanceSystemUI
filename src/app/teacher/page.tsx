'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './student.css'
import { useRouter } from 'next/navigation';
import { Avatar, Button, List, message, Skeleton, Alert } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useStudent, useTeacher } from '@/hooks/useData';
import { useDispatch } from 'react-redux';
import { useRootContext } from '@/context/RootContext';
// services
import { deleteApiAction, getApiAction, postApiAction, updateApiAction } from '@/services/mainService';
import { useAppDispatch } from '@/hooks/useDispatch';
// types
import { TeacherType } from '@/store/teacherSlice';

const StudentPage = () => {
   const dispatch = useAppDispatch()
   const router = useRouter();
   const { user, token } = useAuth()
   const { teacherList } = useTeacher()

   const [loading, setLoading] = useState(false);
   const [messageApi, Notification] = message.useMessage();

   const [search, setSearch] = useState('');
   const [teachers, setTeachers] = useState<TeacherType[]>([]);
   const [filtered, setFiltered] = useState<TeacherType[]>([]);

   const log = () => {
      console.log(
         '\nUser: ', user,
         '\nToken: ', token,
      );
   }

   useEffect(() => {
      getTeacherList(token)
   }, []);
   useEffect(() => {
      if (teacherList.length > 0) {
         setTeachers(teacherList)
      }
   }, [teacherList]);

   const getTeacherList = async (token: string | any) => {
      setLoading(true);
      try {
         const response = await dispatch(getApiAction(token, '', 'teacher'))
         console.log('Response:', response);
         messageApi.success('Lấy danh sách giáo viên thành công!');
         // setteachers(response.data);
      } catch (error: any) {
         console.error('Failed to fetch teacher:', error?.response?.data || error?.message);
         messageApi.error('Lấy danh sách giáo viên thất bại!');
      } finally {
         setLoading(false);
      }
   };

   // Filter list when search input changes
   useEffect(() => {
      const lower = search.toLowerCase();
      const filteredData = teachers.filter(student =>
         student.name?.toLowerCase().includes(lower)
      );
      setFiltered(filteredData);
      console.log('filteredData', filteredData);
   }, [search, teachers]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa giáo viên ${name} không?`)) {
         try {
            const response = dispatch(deleteApiAction(token, id, 'student'))
            messageApi.success(`Xóa giáo viên ${name} thành công!`);
            setTeachers(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            messageApi.error(`Xóa giáo viên ${name} thất bại!`);
            console.log('Failed to delete teacher:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div style={{ height: '100vh', width: '100vw', margin: '0 auto' }}>
         {Notification}
         <div style={{ height: '10vh', textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách giáo viên</h1>
         </div>

         <div className="student-header">
            <input type="text"
               placeholder="Tìm giáo viên..."
               className="student-search"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <Button className="student-add-button" href='/teacher/add_teacher'>Thêm giáo viên</Button>
         </div>


         <div style={{ height: '80vh', width: '70vw', overflow: 'auto', margin: '0 auto' }}>
            <List
               className="demo-loadmore-list"
               loading={loading}
               itemLayout="horizontal"
               dataSource={filtered}
               renderItem={(item: any) => (
                  <List.Item
                     actions={[
                        <a
                           key="edit"
                           style={{ fontWeight: 'bold' }}
                           onClick={() => router.push(`/teacher/update_teacher/${item.id}`)}
                        >
                           Chỉnh sửa
                        </a>,
                        <a
                           key="delete"
                           style={{ fontWeight: 'bold', color: 'red' }}
                           onClick={() => confirmDelete(item.id, item.name)}
                        >
                           Xóa
                        </a>
                     ]}
                  >
                     <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta
                           avatar={<Avatar src={item.avatar} />}
                           title={item.name}
                           description={item.email}
                        />
                     </Skeleton>
                  </List.Item>
               )}
            />
         </div>

      </div>
   );
};

export default StudentPage;