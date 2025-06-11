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
import { getSubjectList } from '@/services/subjectServices';


const SubjectPage = () => {
   const { info, token, isAdmin } = useAuth()

   const { showMessage } = useMessageContext()

   const [search, setSearch]: any = useState('');
   const [subjectList, setSubjectList] = useState<EntityType[]>([]);
   const [filtered, setFiltered] = useState<EntityType[]>([]);

   useEffect(() => {
      getSubjectList(token, setSubjectList)
   }, []);
   // 
   useEffect(() => {
      const normalizedSearch = normalizeString(search);
      const filteredData = subjectList.filter(subj =>
         normalizeString(subj.name || '').includes(normalizedSearch)
      );
      setFiltered(filteredData);
   }, [search, subjectList]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa môn ${name} không?`)) {
         try {
            await axios.delete(`${API.SUBJECTS}${id}/`,
               { headers: { Authorization: `Bearer ${token}` } }
            )
            showMessage('success', `Xóa môn ${name} thành công!`);
            setSubjectList(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            showMessage('error', `Xóa môn ${name} thất bại!`);
            console.error('Failed to delete Subject:', error?.response?.detail || error?.message);
         }
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách môn học</h1>
         </div>

         <div className="header">
            <Input
               size='large'
               placeholder='Tìm môn học...'
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               allowClear
            />
         </div>

         <div style={{ height: '75vh', overflow: 'auto', margin: '0 auto' }}>
            <List
               size='small'
               itemLayout="horizontal"
               dataSource={filtered}
               renderItem={(item: any) => (
                  <List.Item
                     actions={[
                        isAdmin && <Button
                           color="cyan" variant="filled"
                           href={`/subject/update_subject/${item.id}`}
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

export default SubjectPage;