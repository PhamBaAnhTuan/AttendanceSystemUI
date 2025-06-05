'use client';
import '@ant-design/v5-patch-for-react-19';
import { Menu } from 'antd';
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
import { useMessageContext } from '@/context/messageContext'



export default function DashboardLayout({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const { showMessage } = useMessageContext()
   // Map các route cụ thể đến key tương ứng
   const getSelectedKey = (path: string): string => {
      if (path === '/') return 'schedule'; // trang gốc
      if (path.startsWith('/create_session')) return 'create_session';
      if (path.startsWith('/attendance_list')) return 'attendance_list';
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
   const { scope, isAdmin } = useAuth()

   const confirmSignOut = async () => {
      if (confirm(`Bạn có chắc chắn muốn Đăng xuất không?`)) {
         try {
            dispatch(signout())
            showMessage('success', `Đăng xuất thành công!`);
         } catch (error: any) {
            showMessage('error', `Đăng xuất thất bại!`);
            console.log('Failed to delete teacher:', error);
         }
      }
   };

   type MenuItem = GetProp<MenuProps, 'items'>[number];
   const items: MenuItem[] = [
      {
         key: 'attendance_management',
         icon: <TeamOutlined />,
         label: <h4>Điểm danh</h4>,
         children: [
            {
               key: 'create_session',
               icon: <CiCircleList />,
               label: <Link href="/attendance/create_session">Tạo buổi điểm danh</Link>,
            },
            {
               key: 'attendance_list',
               icon: <CiCircleList />,
               label: <Link href="/attendance/attendance_list">Danh sách điểm danh</Link>,
            }
         ]
      },
      {
         key: 'schedule_management',
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
         key: 'teacher_management',
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
            }
         ]
      },
      {
         key: 'student_management',
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
            }
         ]
      },
      {
         key: 'subject_management',
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
            }
         ]
      },
      {
         key: 'class_management',
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
            }
         ]
      },
      {
         key: 'room_management',
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
            }
         ]
      },
      {
         key: 'signout',
         icon: <RxExit color='red' />,
         label: <h4 style={{ color: 'red' }} onClick={confirmSignOut}
         >Đăng xuất</h4>,
      },
   ];

   function filterHidden(items: MenuItem[], hiddenKeys: string[]): MenuItem[] {
      return items
         .filter(item => !hiddenKeys.includes(item?.key))
         .map(item => {
            if (item.children && Array.isArray(item.children)) {
               const filteredChildren = (item.children as MenuItem[]).filter(
                  child => !hiddenKeys.includes(child.key)
               );
               return { ...item, children: filteredChildren };
            }
            return item;
         });
   }
   const hiddenKeys = !isAdmin
      ? ['teacher_management', 'teacher', 'add_teacher',
         'student_management', 'student', 'add_student',
         'class_management', 'class', 'add_class',
         'subject_management', 'subject', 'add_subject',
         'room_management', 'room', 'add_room',
      ]
      : [];

   const filteredItems = filterHidden(items, hiddenKeys);

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
               items={filteredItems}
            />
         </aside>
         <main className={styles.content}>
            {children}
         </main>
      </div>
   );
}
