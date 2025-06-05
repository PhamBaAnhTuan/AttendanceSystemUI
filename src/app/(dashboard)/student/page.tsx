'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './student.css'
import { useRouter } from 'next/navigation';
import { Avatar, Button, List, Skeleton, Input } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { useMessageContext } from '@/context/messageContext';
// types
import { EntityType } from '@/types/types';
import { normalizeString } from '@/utils/normalizeString';


const StudentPage = () => {
   const dispatch = useAppDispatch()
   const router = useRouter();
   const { token, info } = useAuth()

   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   const [search, setSearch] = useState('');
   const [students, setStudents] = useState<EntityType[]>([]);
   const [filtered, setFiltered] = useState<EntityType[]>([]);

   const log = () => {
      console.log(
         '\nUser: ', info,
         '\nToken: ', token,
      );
   }

   useEffect(() => {
      getStudentList(token)
   }, []);

   const getStudentList = async (token: string | any) => {
      setLoading(true);
      try {
         const response = await axios.get(`${API.STUDENTS}`, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         })
         const data = response.data
         console.log('Get student res: ', data);
         setStudents(data);
      } catch (error: any) {
         console.error('Failed to fetch students:', error?.response?.data || error?.message);
      } finally {
         setLoading(false);
      }
   };

   // Filter list when search input changes
   useEffect(() => {
      const normalizedSearch = normalizeString(search);

      const filteredData = students.filter(student =>
         normalizeString(student.name || '').includes(normalizedSearch)
      );

      setFiltered(filteredData);
   }, [search, students]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa sinh viên ${name} không?`)) {
         try {
            await axios.delete(`${API.USERS}${id}/`)
            showMessage('success', `Xóa sinh viên ${name} thành công!`);
            setStudents(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            showMessage('error', `Xóa sinh viên ${name} thất bại!`);
            console.log('Failed to delete student:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h2>Danh sách sinh viên</h2>
         </div>

         <div className="header">
            <Input
               size='large'
               placeholder='Tìm sinh viên...'
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               allowClear
            />
         </div>


         <div style={{ height: '75vh', overflow: 'auto', margin: '0 auto' }}>
            <List
               size='small'
               loading={loading}
               itemLayout="horizontal"
               dataSource={filtered}
               renderItem={(item: any) => (
                  <List.Item
                     actions={[
                        <Button
                           key={'1'}
                           color="cyan" variant="filled"
                           href={`/student/update_student/${item.id}`}
                        >
                           <h5>Chỉnh sửa</h5>
                        </Button>,
                        <Button
                           key={'2'}
                           color="cyan" variant="filled"
                           href={`/student/update_student_class/${item.id}`}
                        >
                           <h5>Thêm vào lớp</h5>
                        </Button>,
                        <Button
                           key={'3'}
                           color="danger" variant="filled"
                           onClick={() => confirmDelete(item.id, item.fullname)}
                        >
                           <h5>Xóa</h5>
                        </Button>
                     ]}
                  >
                     <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta
                           avatar={<Avatar src={item.avatar} />}
                           title={item.fullname}
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