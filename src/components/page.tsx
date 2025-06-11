
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

export default function Home() {
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

  const [mode, setMode] = useState<'vertical' | 'inline'>('inline');
  const [theme, setTheme] = useState<MenuTheme>('light');

  const changeMode = (value: boolean) => {
    setMode(value ? 'vertical' : 'inline');
  };

  const changeTheme = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  };
  return (
    <main className={styles.container}>
      <Menu
        style={{ width: 256 }}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode={mode}
        theme={theme}
        items={items}
      />
    </main>
  );
}
