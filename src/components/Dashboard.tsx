
'use client';

// import styles from './Home.module.css';
import Link from 'next/link';
// hook
import { useAuth } from '@/hooks/useAuth';
// actions
import { signout } from "@/store/authSlice";
// components
import {
   AppstoreOutlined,
   BookOutlined,
   CalendarOutlined,
   LinkOutlined,
   MailOutlined,
   ScheduleOutlined,
   SettingOutlined,
   TeamOutlined,
   UsergroupAddOutlined,
} from '@ant-design/icons';
import { Button, GetProp, Menu, MenuProps, MenuTheme, message } from 'antd';
import AuthGate from '@/components/AuthGate';
import { useAppDispatch } from '@/hooks/useDispatch';
// redux
import { usePathname } from 'next/navigation';
import { useState } from 'react';


type MenuItem = GetProp<MenuProps, 'items'>[number];
const items: MenuItem[] = [
   {
      key: '1',
      icon: <TeamOutlined />,
      label: <Link href="./attendance" >
         Điểm danh
      </Link>
   },
   {
      key: '2',
      icon: <ScheduleOutlined />,
      label: <Link href="./schedule" >
         Đặt lịch học
      </Link>
   },
   {
      key: '3',
      icon: <UsergroupAddOutlined />,
      label: <Link href="./teacher" >
         Thêm giáo viên
      </Link>
   },
   {
      key: '4',
      icon: <UsergroupAddOutlined />,
      label: <Link href="./student" >
         Thêm sinh viên
      </Link>
   },
   {
      key: '5',
      icon: <BookOutlined />,
      label: <Link href="./subject" >
         Thêm môn học
      </Link>
   },
   {
      key: '6',
      icon: <SettingOutlined />,
      label: <Link href="./class" >
         Thêm lớp học
      </Link>
   },
   {
      key: '7',
      icon: <SettingOutlined />,
      label: <Link href="./room" >
         Thêm phòng học
      </Link>
   }
];

const Dashboard = () => {
   const dispatch = useAppDispatch()
   // 
   const signOut = () => {
      dispatch(signout())
   }
   const { isAuthenticated, token, isAdmin } = useAuth();
   const log = () => {
      console.log(
         'Is authenticated: ', isAuthenticated,
         // '\n User: ', user,
         '\n Token: ', token,
         '\n is admin: ', isAdmin,
      );
   }
   return (
      <main className={styles.container}>
         {/* <h1 className={styles.title}>Hệ thống điểm danh sinh viên</h1>
      <p className={styles.description}>
        Vui lòng bấm vào nút bên dưới để tiến hành điểm danh.
      </p>
      <Link href="./attendance" className={styles.button}>
        Điểm danh
      </Link>
      <Link href="./schedule" className={styles.button}>
        Đặt lịch học
      </Link>
      <Link href="./teacher" className={styles.button}>
        Thêm giáo viên
      </Link>
      <Link href="./student" className={styles.button}>
        Thêm sinh viên
      </Link>
      <Link href="./subject" className={styles.button}>
        Thêm môn học
      </Link>
      <Link href="./class" className={styles.button}>
        Thêm lớp học
      </Link>
      <Link href="./room" className={styles.button}>
        Thêm phòng học
      </Link>
      <Button type="primary" className={styles.button} onClick={signOut}>
        Sign Out
      </Button>
      <button style={{ height: '5vh', width: '10vw', alignSelf: 'center' }} onClick={log}>
        LOG
      </button> */}
         <Menu
            style={{ width: 256 }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            items={items}
         />
      </main>
   );
}

export default Dashboard