'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, List, Skeleton, Input } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// types
import { normalizeString } from '@/utils/normalizeString';
import { EntityType } from '@/types/types';
// services
import { getMajorList } from '@/services/majorServices';


const MajorPage = () => {
   const { info, token, isAdmin } = useAuth()

   const [loading, setLoading]: any = useState(false);
   const { showMessage } = useMessageContext()

   const [search, setSearch]: any = useState('');
   const [majorList, setMajorList] = useState<EntityType[]>([]);
   const [filtered, setFiltered] = useState<EntityType[]>([]);

   useEffect(() => {
      getMajorList(token, undefined, setMajorList)
   }, []);

   useEffect(() => {
      const normalizedSearch = normalizeString(search);
      const filteredData = majorList.filter(major =>
         normalizeString(major.name || '').includes(normalizedSearch)
      );
      setFiltered(filteredData);
   }, [search, majorList]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa ngành ${name} không?`)) {
         try {
            await axios.delete(`${API.MAJOR}${id}/`,
               { headers: { Authorization: `Bearer ${token}` } }
            )
            showMessage('success', `Xóa ngành ${name} thành công!`);
            setMajorList(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            showMessage('error', `Xóa ngành ${name} thất bại!`);
            console.error('Failed to delete Major:', error?.response?.detail || error?.message);
         }
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h2>Danh sách các ngành</h2>
         </div>

         <div className="header">
            <Input
               size='large'
               placeholder='Tìm ngành học...'
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
                           href={`/major/update_major/${item.id}`}
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

export default MajorPage;