'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import './subject.css'
import { useRouter } from 'next/navigation';
import { Avatar, Button, List, message, Skeleton, Alert, Input } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
// types
import { normalizeString } from '@/utils/normalizeString';


const SubjectPage = () => {
   const { user, token } = useAuth()

   const [loading, setLoading]: any = useState(false);

   const [search, setSearch]: any = useState('');
   const [subjects, setSubjects]: any = useState([]);
   const [filtered, setFiltered]: any = useState([]);

   const log = () => {
      console.log(
         '\nUser: ', user,
         '\nToken: ', token,
      );
   }

   useEffect(() => {
      getSubjectList(token)
   }, []);

   const getSubjectList = async (token: string | any) => {
      setLoading(true);
      try {
         const res = await axios.get(API.SUBJECTS, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         })
         const data = res.data
         setSubjects(data);
         console.log('Get subject res: ', data);
      } catch (error: any) {
         console.error('Failed to fetch subject:', error?.response?.data || error?.message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      const normalizedSearch = normalizeString(search);

      const filteredData = subjects.filter((subj: any) =>
         normalizeString(subj.name || '').includes(normalizedSearch)
      );

      setFiltered(filteredData);
   }, [search, subjects]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa môn ${name} không?`)) {
         console.log('teacher id: ', id)
         try {
            const res = axios.delete(`${API.SUBJECTS}${id}/`)
            message.success(`Xóa môn ${name} thành công!`);
            setSubjects((prev: any) => prev.filter((s: any) => s.id !== id));
            setFiltered((prev: any) => prev.filter((s: any) => s.id !== id));
         } catch (error: any) {
            message.error(`Xóa môn ${name} thất bại!`);
            console.log('Failed to delete teacher:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h2>Danh sách môn học</h2>
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
               loading={loading}
               itemLayout="horizontal"
               dataSource={filtered}
               renderItem={(item: any) => (
                  <List.Item
                     actions={[
                        <Button
                           color="cyan" variant="filled"
                           href={`/subject/update_subject/${item.id}`}
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

export default SubjectPage;