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
import { getTeacherList } from '@/services/teacherServices';

const TeacherPage = () => {
   const { token, info } = useAuth()

   const [loading, setLoading] = useState(false);

   const [search, setSearch] = useState('');
   const [teacherList, setTeacherList] = useState<UserInfoType[]>([]);
   const [filtered, setFiltered] = useState<UserInfoType[]>([]);

   useEffect(() => {
      getTeacherList(token, setTeacherList)
   }, []);

   useEffect(() => {
      const normalizedSearch = normalizeString(search);
      const filteredData = teacherList.filter(teacher =>
         normalizeString(teacher.fullname || '').includes(normalizedSearch)
      );
      setFiltered(filteredData);
   }, [search, teacherList]);


   const confirmDelete = async (id: string, fullname: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa giáo viên ${fullname} không?`)) {
         try {
            await axios.delete(`${API.TEACHERS}${id}/`, {
               headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  Authorization: `Bearer ${token}`
             }
            })
            message.success(`Xóa giáo viên ${fullname} thành công!`);
            setTeacherList(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            message.error(`Xóa giáo viên ${fullname} thất bại!`);
            console.error('Failed to delete teacher:', error?.response?.detail || error?.message);
         }
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách giáo viên</h1>
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
               loading={false}
               itemLayout="horizontal"
               dataSource={filtered}
               renderItem={(item: any) => (
                  <List.Item
                     actions={[
                        <Button
                           key={'2'}
                           color="cyan" variant="filled"
                           href={`/teacher/update_teacher_class_subject/${item.id}`}
                        >
                           <h5>Gán mối quan hệ với lớp</h5>
                        </Button>,
                        <Button
                           key={'1'}
                           color="cyan" variant="filled"
                           href={`/teacher/update_teacher/${item.id}`}
                        >
                           <h5>Chỉnh sửa</h5>
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
                     <Skeleton avatar title={false} loading={false} active >
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

export default TeacherPage;