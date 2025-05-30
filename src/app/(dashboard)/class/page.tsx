'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './class.css'
import { useRouter } from 'next/navigation';
import { Avatar, Button, List, Skeleton, Input } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext'
// types
import { ClassType } from '@/store/classSlice';
import { normalizeString } from '@/utils/normalizeString';

const ClassPage = () => {
   const router = useRouter();
   const { token } = useAuth()

   const [loading, setLoading] = useState(false);
   const { showMessage } = useMessageContext()

   const [search, setSearch] = useState('');
   const [classes, setClasses] = useState<ClassType[]>([]);
   const [filtered, setFiltered] = useState<ClassType[]>([]);

   const log = () => {
      console.log(
         // '\nUser: ', user,
         '\nToken: ', token,
      );
   }

   useEffect(() => {
      getClassList(token)
   }, []);

   const getClassList = async (token: string | any) => {
      setLoading(true);
      try {
         const res = await axios.get(API.CLASSES, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get class res: ', data);
         setClasses(data);
      } catch (error: any) {
         console.error('Failed to fetch class:', error?.response?.data || error?.message);
      } finally {
         setLoading(false);
      }
   };

   // Filter list when search input changes
   useEffect(() => {
      const normalizedSearch = normalizeString(search);

      const filteredData = classes.filter((cls: any) =>
         normalizeString(cls.name || '').includes(normalizedSearch)
      );

      setFiltered(filteredData);
   }, [search, classes]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa lớp ${name} không?`)) {
         try {
            const res = await axios.delete(`${API.CLASSES}${id}/`)
            showMessage('success', `Xóa lớp ${name} thành công!`);
            setClasses(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            showMessage('error', `Xóa lớp ${name} thất bại!`);
            console.log('Failed to delete class:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div >
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h2>Danh sách lớp học</h2>
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


         <div style={{ height: '75vh', width: '72vw', overflow: 'auto', margin: '0 auto' }}>
            <List
               loading={loading}
               itemLayout="horizontal"
               dataSource={filtered}
               renderItem={(item: any) => (
                  <List.Item
                     actions={[
                        <Button
                           color="cyan" variant="filled"
                           href={`/class/update_class/${item.id}`}
                        >
                           <h5>Chỉnh sửa</h5>
                        </Button>,
                        <Button
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