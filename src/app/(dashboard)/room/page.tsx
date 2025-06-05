'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import './room.css'
import { useRouter } from 'next/navigation';
import { Button, List, message, Skeleton, Input } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
// types
import { EntityType } from '@/types/types';
import { normalizeString } from '@/utils/normalizeString';

const ClassPage = () => {
   const { info, isAdmin, token } = useAuth()

   const [loading, setLoading] = useState(false);

   const [search, setSearch] = useState('');
   const [rooms, setRooms] = useState<EntityType[]>([]);
   const [filtered, setFiltered] = useState<EntityType[]>([]);

   const log = () => {
      console.log(
         '\nUser: ', info,
         '\nToken: ', token,
      );
   }

   useEffect(() => {
      getRoomList(token)
   }, []);

   const getRoomList = async (token: string | any) => {
      setLoading(true);
      try {
         const res = await axios.get(API.ROOMS, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         })
         const data = res.data
         console.log('Get room res: ', data);
         setRooms(data);
      } catch (error: any) {
         console.error('Failed to fetch room:', error?.response?.data || error?.message);
      } finally {
         setLoading(false);
      }
   };

   // Filter list when search input changes
   useEffect(() => {
      const normalizedSearch = normalizeString(search);

      const filteredData = rooms.filter((room: any) =>
         normalizeString(room.name || '').includes(normalizedSearch)
      );

      setFiltered(filteredData);
   }, [search, rooms]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa phòng ${name} không?`)) {
         try {
            const res = await axios.delete(`${API.ROOMS}${id}/`)
            message.success(`Xóa phòng ${name} thành công!`);
            setRooms(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            message.error(`Xóa phòng ${name} thất bại!`);
            console.log('Failed to delete room:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h2>Danh sách phòng học</h2>
         </div>

         <div className="header">
            <Input
               size='large'
               placeholder='Tìm phòng học...'
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
                           href={`/room/update_room/${item.id}`}
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