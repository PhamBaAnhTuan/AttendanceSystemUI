'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, Button, List, Skeleton, Input } from 'antd';
import { API } from '@/constants/api'
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { useMessageContext } from '@/context/messageContext';
// types
import { UserInfoType } from '@/types/types';
import { normalizeString } from '@/utils/normalizeString';
import { getStudentClassRelation, getStudentList } from '@/services/studentServices';


const StudentPage = () => {
   const searchParams = useSearchParams();
   const classID = searchParams.get('classID');
   const { token, info, isAdmin } = useAuth()
   const { showMessage } = useMessageContext()

   const [search, setSearch] = useState('');
   const [studentList, setStudentList] = useState<UserInfoType[]>([]);
   const [filtered, setFiltered] = useState<UserInfoType[]>([]);
   const [className, setClassName] = useState();

   useEffect(() => {
      if (classID) {
         getStudentClassRelation(token, classID, setStudentList, setClassName)
      } else {
         getStudentList(token, setStudentList)
      }
   }, []);
   // Filter list when search input changes
   useEffect(() => {
      if (studentList.length > 0) {
         const normalizedSearch = normalizeString(search);
         const filteredData = studentList.filter(student =>
            normalizeString(student.fullname || '').includes(normalizedSearch)
         );
         setFiltered(filteredData);
      } else {
         setFiltered([])
      }
   }, [search, studentList]);

   const confirmDelete = async (id: number, fullname: string) => {
      if (confirm(`Bạn có chắc chắn muốn xóa sinh viên ${fullname} không?`)) {
         try {
            await axios.delete(`${API.USERS}${id}/`, {
               headers: {
                  'ngrok-skip-browser-warning': 'true',
                  Authorization: `Bearer ${token}`
               },
            })
            showMessage('success', `Xóa sinh viên ${fullname} thành công!`);
            setStudentList(prev => prev.filter(s => s.id !== id));
            setFiltered(prev => prev.filter(s => s.id !== id));
         } catch (error: any) {
            showMessage('error', `Xóa sinh viên ${fullname} thất bại!`);
            console.error('Failed to delete student:', error?.response?.data || error?.message);
         }
      }
   };

   return (
      <div>
         <div style={{ textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách sinh viên {classID ? `lớp ${className}` : ''}</h1>
         </div>

         <div className="header">
            <Input
               size='large'
               placeholder='Tìm sinh viên...'
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
                        !isAdmin && <Button
                           key={'1'}
                           color="cyan" variant="filled"
                           href={`/student/update_student/${item.id}`}
                        >
                           <h5>Thông tin sinh viên</h5>
                        </Button>,
                        isAdmin && <Button
                           key={'1'}
                           color="cyan" variant="filled"
                           href={`/student/update_student/${item.id}`}
                        >
                           <h5>Chỉnh sửa</h5>
                        </Button>,
                        isAdmin && <Button
                           key={'2'}
                           color="cyan" variant="filled"
                           href={`/student/update_student_class/${item.id}`}
                        >
                           <h5>Thêm vào lớp</h5>
                        </Button>,
                        isAdmin && <Button
                           key={'3'}
                           color="danger" variant="filled"
                           onClick={() => confirmDelete(item.id, item.fullname)}
                        >
                           <h5>Xóa</h5>
                        </Button>
                     ]}
                  >
                     <Skeleton avatar title={false} loading={false} active>
                        <List.Item.Meta
                           avatar={<Avatar src={item?.avatar} />}
                           title={item?.fullname}
                           description={item?.email}
                           children={[
                              <h4>{item?.fullname}</h4>
                           ]}
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