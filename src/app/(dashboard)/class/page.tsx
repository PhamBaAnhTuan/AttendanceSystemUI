'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Avatar, Button, List, Skeleton, Input } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext'
// types
import { normalizeString } from '@/utils/normalizeString';
import { EntityType } from '@/types/types';
import { getClassList } from '@/services/classServices';
import { getTeacherClassRelation } from '@/services/teacherServices';

const ClassPage = () => {
   const router = useRouter();
   const { token, isAdmin, info } = useAuth()
   const API_URL = isAdmin ? API.CLASSES : API.TEACHER_CLASS_SUBJECT;

   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   const [search, setSearch] = useState('');
   const [classList, setClassList] = useState<EntityType[]>([]);
   const [teacherClassRelation, setTeacherClassRelation] = useState([]);
   const [filtered, setFiltered] = useState<EntityType[]>([]);

   useEffect(() => {
      if (isAdmin) {
         getClassList(token, setClassList)
      } else {
         getTeacherClassRelation(token, info?.id, undefined, setTeacherClassRelation)
      }
   }, []);
   useEffect(() => {
      if (teacherClassRelation) {
         const classes = teacherClassRelation?.map((item: any) => item?.classes)
         setClassList(classes)
      }
   }, [teacherClassRelation])
   // 
   useEffect(() => {
      const normalizedSearch = normalizeString(search);
      const filteredData = classList?.filter(cls =>
         normalizeString(cls?.name || '').includes(normalizedSearch)
      );
      setFiltered(filteredData);
   }, [search, classList]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa lớp ${name} không?`)) {
         try {
            const res = await axios.delete(`${API.CLASSES}${id}/`,
               {
                  headers: {
                     'ngrok-skip-browser-warning': 'true',
                     Authorization: `Bearer ${token}`
                  }
               }
            )
            showMessage('success', `Xóa lớp ${name} thành công!`);
            setClassList(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            showMessage('error', `Xóa lớp ${name} thất bại!`);
            console.error('Failed to delete class:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div >
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách lớp học</h1>
         </div>

         <div className="header">
            <Input
               size='large'
               placeholder='Tìm lớp học...'
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
                           color="cyan" variant="filled"
                           onClick={() => router.push(`student?classID=${item.id}`)}
                        >
                           <h5>Danh sách sinh viên</h5>
                        </Button>,
                        isAdmin && <Button
                           color="cyan" variant="filled"
                           href={`/class/update_class/${item.id}`}
                        >
                           <h5>Chỉnh sửa</h5>
                        </Button>,
                        isAdmin && <Button
                           color="danger" variant="filled"
                           onClick={() => confirmDelete(item.id, item.name)}
                        >
                           <h5>Xóa</h5>
                        </Button>
                     ]}
                  >
                     <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta
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

export default ClassPage;