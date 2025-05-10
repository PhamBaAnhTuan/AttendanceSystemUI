'use client'
import React, { useEffect, useState } from 'react';
import { Avatar, Button, List, Skeleton } from 'antd';
import styles from './page.module.css'
import { API } from '@/constants/api'

interface DataType {
   gender?: string;
   name?: string;
   email?: string;
   avatar?: string;
   loading: boolean;
}

const url = API.SUBJECTS

const SubjectPage = () => {
   const [loading, setLoading] = useState(true);
   const [students, setStudents] = useState<DataType[]>([]);

   const fetchAllStudents = async () => {
      try {
         const res = await fetch(url);
         const data = await res.json();
         setStudents(data);
      } catch (error) {
         console.error('Failed to fetch subject:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchAllStudents();
   }, []);

   return (
      <div style={{ height: '100vh', width: '100vw', margin: '0 auto' }}>
         <div style={{ height: '10vh', textAlign: 'center', alignContent: 'center' }}>
            <h1>Danh sách subject</h1>
         </div>

         <div style={{ height: '80vh', width: '70vw', overflow: 'auto', margin: '0 auto' }}>
            <List
               className="demo-loadmore-list"
               loading={loading}
               itemLayout="horizontal"
               dataSource={students}
               renderItem={(item) => (
                  <List.Item
                     actions={[
                        <a style={{ fontWeight: 'bold' }}>Edit info</a>,
                        <a style={{ fontWeight: 'bold', color: 'red' }}>Delete</a>
                     ]}
                  >
                     <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta
                           avatar={<Avatar src={item.avatar} />}
                           title={<a href="#">{item.name}</a>}
                           description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                        />
                        {/* <div>content</div> */}
                     </Skeleton>
                  </List.Item>
               )}
            />
         </div>
         <div style={{ height: '10vh', width: '70vw', margin: '0 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button style={{ backgroundColor: 'lightblue', justifySelf: 'end' }} href='./add_student'>Add subject</Button>
         </div>
      </div>
   );
};

export default SubjectPage;
