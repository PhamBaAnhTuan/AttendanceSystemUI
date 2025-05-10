'use client';
import { useState } from 'react';
import styles from './Attendance.module.css';

export default function AttendancePage() {
  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setMessage('Vui lòng nhập mã số sinh viên.');
      return;
    }
    // Gửi lên API (giả lập)
    setMessage(`✅ Sinh viên ${studentId} đã điểm danh thành công!`);
    setStudentId('');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Điểm danh sinh viên</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Nhập mã số sinh viên"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Gửi điểm danh
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
