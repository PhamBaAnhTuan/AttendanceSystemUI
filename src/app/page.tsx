
'use-client';

import styles from './Home.module.css';
import Link from 'next/link';
// components

export default function Home() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Hệ thống điểm danh sinh viên</h1>
      <p className={styles.description}>
        Vui lòng bấm vào nút bên dưới để tiến hành điểm danh.
      </p>
      <Link href="./attendance" className={styles.button}>
        Điểm danh
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
    </main>
  );
}
