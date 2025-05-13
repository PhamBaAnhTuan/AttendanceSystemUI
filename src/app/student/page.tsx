'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './student.css'
import { useRouter } from 'next/navigation';
import { Avatar, Button, List, message, Skeleton, Alert } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/hooks/useData';
import { useDispatch } from 'react-redux';
import { useRootContext } from '@/context/RootContext';
// services
import { deleteApiAction, getApiAction, postApiAction, updateApiAction } from '@/services/mainService';
import { useAppDispatch } from '@/hooks/useDispatch';
// types
import { StudentType } from '@/store/studentSlice';


const url = API.STUDENTS

const StudentPage = () => {
   const dispatch = useAppDispatch()
   const router = useRouter();
   const { user, token } = useAuth()
   const { studentList } = useStudent()

   const [loading, setLoading] = useState(false);
   const [messageApi, Notification] = message.useMessage();

   const [search, setSearch] = useState('');
   const [students, setStudents] = useState<StudentType[]>([]);
   const [filtered, setFiltered] = useState<StudentType[]>([]);

   const log = () => {
      console.log(
         '\nUser: ', user,
         '\nToken: ', token,
      );
   }

   useEffect(() => {
      getStudentList(token)
   }, []);
   useEffect(() => {
      if (studentList.length > 0) {
         setStudents(studentList)
      }
   }, [studentList]);

   const getStudentList = async (token: string | any) => {
      setLoading(true);
      try {
         const response = await dispatch(getApiAction(token, '', 'student'))
         console.log('Response:', response);
         messageApi.success('Lấy danh sách sinh viên thành công!');
         // setStudents(response.data);
      } catch (error: any) {
         console.error('Failed to fetch students:', error?.response?.data || error?.message);
         messageApi.error('Lấy danh sách sinh viên thất bại!');
      } finally {
         setLoading(false);
      }
   };

   // Filter list when search input changes
   useEffect(() => {
      const lower = search.toLowerCase();
      const filteredData = students.filter(student =>
         student.name?.toLowerCase().includes(lower)
      );
      setFiltered(filteredData);
      console.log('filteredData', filteredData);
   }, [search, students]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa sinh viên ${name} không?`)) {
         try {
            const response = dispatch(deleteApiAction(token, id, 'student'))
            messageApi.success(`Xóa sinh viên ${name} thành công!`);
            setStudents(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            messageApi.error(`Xóa sinh viên ${name} thất bại!`);
            console.log('Failed to delete student:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div style={{ height: '100vh', width: '100vw', margin: '0 auto' }}>
         {Notification}
         <div style={{ height: '10vh', textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách sinh viên</h1>
         </div>

         <div className="student-header">
            <input type="text"
               placeholder="Tìm sinh viên..."
               className="student-search"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <Button className="student-add-button" href='/student/add_student'>Thêm sinh viên</Button>
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
                           onClick={() => router.push(`/student/update_student/${item.id}`)}
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