'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './subject.css'
import { useRouter } from 'next/navigation';
import { Avatar, Button, List, message, Skeleton, Alert } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useSubject } from '@/hooks/useData';
import { useDispatch } from 'react-redux';
import { useRootContext } from '@/context/RootContext';
// services
import { deleteApiAction, getApiAction, postApiAction, updateApiAction } from '@/services/mainService';
import { useAppDispatch } from '@/hooks/useDispatch';
// types
import { StudentType } from '@/store/studentSlice';


const SubjectPage = () => {
   const dispatch = useAppDispatch()
   const router = useRouter();
   const { user, token } = useAuth()
   const { subjectList } = useSubject()

   const [loading, setLoading] = useState(false);
   const [messageApi, Notification] = message.useMessage();

   const [search, setSearch] = useState('');
   const [subjects, setSubjects] = useState<StudentType[]>([]);
   const [filtered, setFiltered] = useState<StudentType[]>([]);

   const log = () => {
      console.log(
         '\nUser: ', user,
         '\nToken: ', token,
      );
   }

   useEffect(() => {
      getSubjectList(token)
   }, []);
   useEffect(() => {
      if (subjectList.length > 0) {
         setSubjects(subjectList)
      }
   }, [subjectList]);

   const getSubjectList = async (token: string | any) => {
      setLoading(true);
      try {
         const response = await dispatch(getApiAction(token, '', 'subject'))
         console.log('Response:', response);
         messageApi.success('Lấy danh sách môn học thành công!');
      } catch (error: any) {
         console.error('Failed to fetch subject:', error?.response?.data || error?.message);
         messageApi.error('Lấy danh sách môn học thất bại!');
      } finally {
         setLoading(false);
      }
   };

   // Filter list when search input changes
   useEffect(() => {
      const lower = search.toLowerCase();
      const filteredData = subjects.filter(subject =>
         subject.name?.toLowerCase().includes(lower)
      );
      setFiltered(filteredData);
      console.log('filteredData', filteredData);
   }, [search, subjects]);

   const confirmDelete = async (id: number, name: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa môn ${name} không?`)) {
         try {
            const response = dispatch(deleteApiAction(token, id, 'subject'))
            messageApi.success(`Xóa môn ${name} thành công!`);
            setSubjects(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            messageApi.error(`Xóa môn ${name} thất bại!`);
            console.log('Failed to delete subject:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div style={{ height: '100vh', width: '100vw', margin: '0 auto' }}>
         {Notification}
         <div style={{ height: '10vh', textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách môn học</h1>
         </div>

         <div className="student-header">
            <input type="text"
               placeholder="Tìm môn học..."
               className="student-search"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <Button className="student-add-button" href='/subject/add_subject'>Thêm môn học</Button>
         </div>


         <div style={{ height: '80vh', width: '70vw', overflow: 'auto', margin: '0 auto' }}>
            <List
               className="demo-loadmore-list"
               loading={loading}
               itemLayout="horizontal"
               dataSource={filtered}
               renderItem={(item: any) => (
                  <List.Item
                     actions={[
                        <a
                           key="edit"
                           style={{ fontWeight: 'bold' }}
                           onClick={() => router.push(`/subject/update_subject/${item.id}`)}
                        >
                           Chỉnh sửa
                        </a>,
                        <a
                           key="delete"
                           style={{ fontWeight: 'bold', color: 'red' }}
                           onClick={() => confirmDelete(item.id, item.name)}
                        >
                           Xóa
                        </a>
                     ]}
                  >
                     <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta
                           avatar={<Avatar src={item.avatar} />}
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