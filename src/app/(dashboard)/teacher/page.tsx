'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, Button, List, message, Skeleton, Input } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
// types
import { UserInfoType } from '@/types/types';
// utils
import { normalizeString } from '@/utils/normalizeString';

const StudentPage = () => {
   const { token } = useAuth()

   const [loading, setLoading] = useState(false);

   const [search, setSearch] = useState('');
   const [teachers, setTeachers] = useState<UserInfoType[]>([]);
   const [filtered, setFiltered] = useState<UserInfoType[]>([]);

   // const log = () => {
   //    console.log(
   //       '\nUser: ', user,
   //       '\nToken: ', token,
   //    );
   // }

   useEffect(() => {
      getTeacherList()
   }, []);

   const getTeacherList = async () => {
      setLoading(true);
      try {
         const res = await axios.get(API.TEACHERS, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         })
         const data = res.data
         setTeachers(data)
         console.log('Get teacher res: ', data);
      } catch (error: any) {
         console.error('Failed to fetch teacher:', error?.response?.detail || error?.message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      const normalizedSearch = normalizeString(search);

      const filteredData = teachers.filter(teacher =>
         normalizeString(teacher.fullname || '').includes(normalizedSearch)
      );

      setFiltered(filteredData);
   }, [search, teachers]);


   const confirmDelete = async (id: string, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa giáo viên ${name} không?`)) {
         console.log('teacher id: ', id)
         try {
            await axios.delete(`${API.TEACHERS}${id}/`)
            message.success(`Xóa giáo viên ${name} thành công!`);
            setTeachers(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            message.error(`Xóa giáo viên ${name} thất bại!`);
            console.log('Failed to delete teacher:', error?.response?.detail || error?.message);
         }
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h2>Danh sách giáo viên</h2>
         </div>

         <div className="header">
            <Input
               size='large'
               placeholder='Tìm giáo viên...'
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
                           href={`/teacher/update_teacher/${item.id}`}
                        >
                           <h5>Chỉnh sửa</h5>
                        </Button>,
                        <Button
                           key={'2'}
                           color="cyan" variant="filled"
                           href={`/teacher/update_teacher_class_subject/${item.id}`}
                        >
                           <h5>Gán mối quan hệ với lớp</h5>
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
                     <Skeleton avatar title={false} loading={loading} active >
                        <List.Item.Meta
                           key={item.id}
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