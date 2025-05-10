'use client'
import React, { useEffect, useState } from 'react';
import { Avatar, Button, List, message, Skeleton, Alert } from 'antd';
import './student.css'
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/useData';
import { useDispatch } from 'react-redux';
import { fetchStudentsAction } from '@/store/studentSlice';
import { getStudentsAPI } from '@/services/studentService';
import axios from 'axios';
import { API } from '@/constants/api'

interface DataType {
   id?: number;
   gender?: string;
   name?: string;
   email?: string;
   avatar?: string;
   loading: boolean;
}

const url = API.STUDENTS

const StudentPage = () => {
   const router = useRouter();
   const dispatch = useDispatch();
   const { studentList, isLoading } = useData();
   const [messageApi, contextHolder] = message.useMessage();

   const [loading, setLoading] = useState(true);
   const [search, setSearch] = useState('');
   const [students, setStudents] = useState<DataType[]>([]);
   const [filtered, setFiltered] = useState<DataType[]>([]);

   useEffect(() => {
      getStudentList()
   }, []);
   // Hàm xử lý submit form
   const getStudentList = async () => {
      setLoading(true);
      try {
         const response = await axios.get(url);
         console.log('Response:', response.data);
         messageApi.open({
            type: 'success',
            content: 'Get student successfully!',
         });
         setStudents(response.data);
      } catch (error: any) {
         console.error('Failed to fetch students:', error?.response?.data || error?.message);
         messageApi.open({
            type: 'error',
            content: 'Get student failed!',
         });
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
      // console.log('filteredData', filteredData);
   }, [search, students]);

   const confirmDelete = (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa sinh viên ${name} không?`)) {
         try {
            const response = axios.delete(`${url}${id}/`);
            messageApi.open({
               type: 'success',
               content: `Delete ${name} successfully!`,
            });
            setStudents(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            messageApi.open({
               type: 'error',
               content: `Delete ${name} failed!`,
            });
            console.log('Failed to delete student:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div style={{ height: '100vh', width: '100vw', margin: '0 auto' }}>
         {contextHolder}
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
            <Button className="student-add-button" href='/student/add_student'>Add student</Button>
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
                           Edit info
                        </a>,
                        <a
                           key="delete"
                           style={{ fontWeight: 'bold', color: 'red' }}
                           onClick={() => confirmDelete(item.id, item.name)}
                        >
                           Delete
                        </a>
                     ]}
                  >
                     <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta
                           avatar={<Avatar src={item.avatar ? item.avatar : 'https://yt3.googleusercontent.com/VqV4SQhYwhywzyZeHUWPhCR-vY23p-N_2SHi04YpCLoW__WlDi6HG6k0-VVPu408G_jMcdGq=s900-c-k-c0x00ffffff-no-rj'} />}
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