'use client';

import styles from './Home.module.css';
import Link from 'next/link';
import { useRootContext } from '@/context/RootContext';
import { useAuth } from '@/hooks/useAuth';
import { useStudent, useTeacher } from '@/hooks/useData';
import { Button } from 'antd';
import { useAppDispatch } from '@/hooks/useDispatch';
import { signout } from "@/store/authSlice";
import Navbar from '@/components/Navbar';

export default function Home() {
  const dispatch = useAppDispatch();
  const { messageApi, contextHolder } = useRootContext();
  const { isAuthenticated, user, token } = useAuth();
  const { studentList } = useStudent();
  const { teacherList } = useTeacher();

  return (
    <>
      {contextHolder}
      <Navbar />
      <main className={styles.container}>
        <h1 className={styles.title}>Hệ thống điểm danh sinh viên</h1>
        <p className={styles.description}>
          Vui lòng bấm vào nút bên dưới để tiến hành điểm danh.
        </p>
        <Link href="./attendance" className={styles.button}>Điểm danh</Link>
        <Link href="./teacher" className={styles.button}>Thêm giáo viên</Link>
        <Link href="./student" className={styles.button}>Thêm sinh viên</Link>
        <Link href="./subject" className={styles.button}>Thêm môn học</Link>
        <Link href="./class" className={styles.button}>Thêm lớp học</Link>
        <Link href="./room" className={styles.button}>Thêm phòng học</Link>
        <Button type="primary" className={styles.button} onClick={() => dispatch(signout())}>
          Đăng xuất
        </Button>
      </main>
    </>
  );
}
