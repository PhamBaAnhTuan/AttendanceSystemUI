
'use client';

import styles from './Home.module.css';
import Link from 'next/link';
// hook
import { useRootContext } from '@/context/RootContext';
import { useAuth } from '@/hooks/useAuth';
import { useStudent, useTeacher } from '@/hooks/useData';
// actions
// import { signoutAction } from '@/services/authService';
// components
import { Button } from 'antd';
import AuthGate from '@/components/AuthGate';
import { useAppDispatch } from '@/hooks/useDispatch';
// redux
import { signinStart, signinSuccess, signinFailure, signout } from "@/store/authSlice";
import { usePathname } from 'next/navigation';

export default function Home() {
  const dispatch = useAppDispatch()
  const { loading, setLoading, messageApi, contextHolder } = useRootContext();
  const { isAuthenticated, user, token } = useAuth();
  const { studentList } = useStudent();
  const { teacherList } = useTeacher();
  const pathname = usePathname();

  const log = () => {
    console.log(
      'Is authenticated: ', isAuthenticated,
      '\nUser: ', user,
      '\nToken: ', token,
      '\n Student list: ', studentList,
      '\n Teacher list: ', teacherList,
    );
  }

  return (
    //<AuthGate>
    <main className={styles.container}>
      <h1 className={styles.title}>Hệ thống điểm danh sinh viên</h1>
      <p className={styles.description}>
        Vui lòng bấm vào nút bên dưới để tiến hành điểm danh.
      </p>
      <Link href="./attendance" className={styles.button}>
        Điểm danh
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
      <Button type="primary" className={styles.button} onClick={() => dispatch(signout())}>
        Sign Out
      </Button>
      {/* <button style={{ height: '5vh', width: '10vw', alignSelf: 'center' }} onClick={log}>
        LOG
      </button> */}
    </main>
    //</AuthGate>
  );
}
