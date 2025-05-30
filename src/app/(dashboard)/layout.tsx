'use client';

import { Menu, message, } from 'antd';
import Link from 'next/link';
import {
   BookOutlined,
   ScheduleOutlined,
   TeamOutlined,
   UsergroupAddOutlined,
} from '@ant-design/icons';
import { CiCircleList } from "react-icons/ci";
import { BsPersonPlus } from "react-icons/bs";
import { FaBookMedical } from "react-icons/fa";
import { SiGoogleclassroom } from "react-icons/si";
import { RxExit } from "react-icons/rx";

// 
import { GetProp, MenuProps } from 'antd';
import styles from './layout.module.css';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { signout } from '@/store/authSlice';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   // Map các route cụ thể đến key tương ứng
   const getSelectedKey = (path: string): string => {
      if (path === '/') return 'schedule'; // trang gốc
      // if (path.startsWith('/schedule')) return 'schedule';
      if (path.startsWith('/attendance')) return 'attendance';
      if (path.startsWith('/schedule')) return path.includes('add') ? 'add_schedule' : 'schedule';
      if (path.startsWith('/teacher')) return path.includes('add') ? 'add_teacher' : 'teacher';
      if (path.startsWith('/student')) return path.includes('add') ? 'add_student' : 'student';
      if (path.startsWith('/subject')) return path.includes('add') ? 'add_subject' : 'subject';
      if (path.startsWith('/class')) return path.includes('add') ? 'add_class' : 'class';
      if (path.startsWith('/room')) return path.includes('add') ? 'add_room' : 'room';
      return '';
   };
   const [selectedKey, setSelectedKey] = useState(getSelectedKey(pathname));
   useEffect(() => {
      setSelectedKey(getSelectedKey(pathname));
   }, [pathname]);

   const dispatch = useAppDispatch()
   const { scope } = useAuth()
   let isAdmin
   if (scope && scope === 'admin') {
      isAdmin = true
   }
   const confirmSignOut = async () => {
      if (confirm(`Bạn có chắc chắn muốn Đăng xuất không?`)) {
         try {
            dispatch(signout())
            message.success(`Đăng xuất thành công!`);
         } catch (error: any) {
            message.error(`Đăng xuất thất bại!`);
            console.log('Failed to delete teacher:', error);
         }
      }
   };
   type MenuItem = GetProp<MenuProps, 'items'>[number];
   const items: MenuItem[] = [
      {
         key: 'attendance',
         icon: <TeamOutlined />,
         label: <h4><Link href="/attendance">Điểm danh</Link></h4>,
      },
      {
         key: '2',
         icon: <ScheduleOutlined />,
         label: <h4>Thời khóa biểu</h4>,
         children: [
            {
               key: 'schedule',
               icon: <CiCircleList />,
               label: <Link href="/">Danh sách</Link>,
            },
            {
               key: 'add_schedule',
               icon: <ScheduleOutlined />,
               label: <Link href="/schedule/add_schedule">Đặt thời khóa biểu</Link>,
            }
         ]
      },
      {
         key: '3',
         icon: <UsergroupAddOutlined />,
         label: <h4>Quản lý giáo viên</h4>,
         children: [
            {
               key: 'teacher',
               icon: <CiCircleList />,
               label: <Link href="/teacher">Danh sách giáo viên</Link>,
            },
            {
               key: 'add_teacher',
               icon: <BsPersonPlus />,
               label: <Link href="/teacher/add_teacher">Thêm giáo viên</Link>,
               disabled: !isAdmin
            }
         ]
      },
      {
         key: '4',
         icon: <UsergroupAddOutlined />,
         label: <h4>Quản lý sinh viên</h4>,
         children: [
            {
               key: 'student',
               icon: <CiCircleList />,
               label: <Link href="/student">Danh sách sinh viên</Link>,
            },
            {
               key: 'add_student',
               icon: <BsPersonPlus size={20} />,
               label: <Link href="/student/add_student">Thêm sinh viên</Link>,
               disabled: !isAdmin
            }
         ]
      },
      {
         key: '5',
         icon: <BookOutlined />,
         label: <h4>Quản lý môn học</h4>,
         children: [
            {
               key: 'subject',
               icon: <CiCircleList />,
               label: <Link href="/subject">Danh sách môn học</Link>,
            },
            {
               key: 'add_subject',
               icon: <FaBookMedical size={20} />,
               label: <Link href="/subject/add_subject">Thêm môn học</Link>,
               disabled: !isAdmin
            }
         ]
      },
      {
         key: '6',
         icon: <SiGoogleclassroom />,
         label: <h4>Quản lý lớp học</h4>,
         children: [
            {
               key: 'class',
               icon: <CiCircleList />,
               label: <Link href="/class">Danh sách lớp học</Link>,
            },
            {
               key: 'add_class',
               icon: <SiGoogleclassroom size={20} />,
               label: <Link href="/class/add_class">Thêm lớp học</Link>,
               disabled: !isAdmin
            }
         ]
      },
      {
         key: '7',
         icon: <SiGoogleclassroom />,
         label: <h4>Quản lý phòng học</h4>,
         children: [
            {
               key: 'room',
               icon: <CiCircleList size={20} />,
               label: <Link href="/room">Danh sách phòng học</Link>,
            },
            {
               key: 'add_room',
               icon: <SiGoogleclassroom size={20} />,
               label: <Link href="/room/add_room">Thêm phòng học</Link>,
               disabled: !isAdmin
            }
         ]
      },
      {
         key: '8',
         icon: <RxExit color='red' />,
         label: <h4 style={{ color: 'red' }} onClick={confirmSignOut}
         >Đăng xuất</h4>,
      },
   ];

   return (
      <div className={styles.layout}>
         <aside className={styles.sidebar}>
            <img
               src='https://donga.edu.vn/portals/0/Images/UDA_logo.png'
               height={80}
               width={'90%'}
            />
            <Menu
               style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}
               defaultSelectedKeys={[selectedKey]}
               mode="inline"
               items={items}
            />
         </aside>
         <main className={styles.content}>
            {children}
         </main>
      </div>
   );
}
