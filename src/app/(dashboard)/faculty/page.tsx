'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button, List, Skeleton, Input } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// types
import { normalizeString } from '@/utils/normalizeString';
import { EntityType } from '@/types/types';
// services
import { getFacultyList } from '@/services/facultyServices';


const FacultyPage = () => {
   const { info, token, isAdmin } = useAuth()
   // const API_URL = isAdmin ? API.SUBJECTS : API.TEACHER_SUBJECT;

   const [loading, setLoading]: any = useState(false);
   const { showMessage } = useMessageContext()

   const [search, setSearch]: any = useState('');
   const [facultyList, setFacultyList] = useState<EntityType[]>([]);
   const [filtered, setFiltered] = useState<EntityType[]>([]);

   useEffect(() => {
      getFacultyList(token, setFacultyList)
   }, []);
   // 
   useEffect(() => {
      const normalizedSearch = normalizeString(search);
      const filteredData = facultyList.filter(faculty =>
         normalizeString(faculty.name || '').includes(normalizedSearch)
      );
      setFiltered(filteredData);
   }, [search, facultyList]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa khoa ${name} không?`)) {
         try {
            await axios.delete(`${API.FACULTY}${id}/`,
               {
                  headers: {
                     'ngrok-skip-browser-warning': 'true',
                     Authorization: `Bearer ${token}`
                  }
               }
            )
            showMessage('success', `Xóa khoa ${name} thành công!`);
            setFacultyList(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            showMessage('error', `Xóa khoa ${name} thất bại!`);
            console.error('Failed to delete Subject:', error?.response?.detail || error?.message);
         }
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách các khoa</h1>
         </div>

         <div className="header">
            <Input
               size='large'
               placeholder='Tìm khoa...'
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
                        isAdmin && <Button
                           color="cyan" variant="filled"
                           href={`/faculty/update_faculty/${item.id}`}
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

export default FacultyPage;