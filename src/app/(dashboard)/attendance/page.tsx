
'use client';
import './attendance.css';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { API } from '@/constants/api';
import { Button } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';

function StreamCamera() {
   const { token } = useAuth();
   const router = useRouter();
   const searchParams = useSearchParams();
   const sessionID = searchParams.get('sessionID');
   const videoRef = useRef<HTMLVideoElement>(null);

   const { showMessage } = useMessageContext();
   const [images, setImages] = useState<string[]>([]);
   const [isCapturing, setIsCapturing] = useState(false);
   const [instruction, setInstruction] = useState('');
   const [recognizedStudents, setRecognizedStudents] = useState<any[]>([]);

   // Hướng dẫn từng ảnh
   const directions = ['Chụp chính diện', 'Chụp nghiêng trái', 'Chụp nghiêng phải'];

   // Mở camera và tạo session điểm danh
   useEffect(() => {
      const startCamera = async () => {
         try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
               videoRef.current.srcObject = stream;
            }
         } catch (error) {
            console.error("Không thể truy cập camera:", error);
         }
      };

      startCamera();

      return () => {
         if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream)
               .getTracks()
               .forEach(track => track.stop());
         }
      };
   }, [token]);

   // base64 → blob
   const base64ToBlob = async (base64Data: string): Promise<Blob> => {
      const res = await fetch(base64Data);
      return await res.blob();
   };

   // Gửi ảnh nhận diện
   const sendToAttendanceSession = async (imageBlob: Blob) => {
      if (!sessionID) return;

      const formData = new FormData();
      formData.append('image', imageBlob);

      try {
         const res = await axios.post(
            `${API.ATTENDANCE}${sessionID}/take_attendance/`,
            formData,
            {
               headers: { Authorization: `Bearer ${token}` },
            }
         );
         const data = res.data;
         console.log('Kết quả nhận diện:', data);
         if (data?.marked_students) {
            setRecognizedStudents((prevStudents) => {
               const newStudents = data.marked_students.filter(
                  (student: any) => !prevStudents.some(s => s.student_id === student.student_id)
               );
               return [...prevStudents, ...newStudents];
            });
         }

      } catch (error: any) {
         console.error('Lỗi gửi ảnh lên nhận diện:', error.response.data);
      }
   };

   // Chụp ảnh + gửi lên
   const captureAndSend = async () => {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      if (!video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const dataURL = canvas.toDataURL('image/png');
      const blob = await base64ToBlob(dataURL);

      await sendToAttendanceSession(blob);
      setImages((prev) => [...prev, dataURL]);
   };

   // Tiến trình chụp 3 ảnh
   const startFullCaptureSequence = async () => {
      if (!sessionID) return;
      setIsCapturing(true);
      for (let i = 0; i < directions.length; i++) {
         setInstruction(directions[i]);
         await new Promise(res => setTimeout(res, 800));
         await captureAndSend();
      }
      setInstruction('✅ Đã hoàn tất điểm danh');
      setIsCapturing(false);
   };
   // End attendance session
   const endAttendanceSession = async () => {
      if (!sessionID) return;

      try {
         const res = await axios.post(
            `${API.ATTENDANCE}${sessionID}/end-session/`,
            { end_session: true },
            {
               headers: { Authorization: `Bearer ${token}` },
            }
         );
         const data = res.data;
         console.log('End session res: ', data);
         if (data) {
            showMessage('success', 'Phiên điểm danh đã kết thúc thành công!');
            router.replace('/attendance/attendance_list');
         }
      } catch (error) {
         console.error('End session error: ', error);
      }
   };

   return (
      <div className="camera-container">

         <div className="left-panel">
            <h1 className="heading">Điểm danh sinh viên</h1>
            <video ref={videoRef} autoPlay playsInline className="video" />
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 500, color: '#555' }}>
               {sessionID
                  ? instruction || 'Đã sẵn sàng điểm danh'
                  : '⏳ Đang tạo phiên điểm danh...'}
            </div>
            <div className="buttonGroup">
               <Button type="primary" onClick={startFullCaptureSequence} disabled={isCapturing || !sessionID}>
                  <h4>{isCapturing ? 'Đang chụp...' : 'Bắt đầu chụp'}</h4>
               </Button>
               <Button danger onClick={endAttendanceSession} disabled={isCapturing}>
                  <h4>Thoát</h4>
               </Button>
            </div>
         </div>

         <div className="right-panel">
            <h3>Danh sách sinh viên đã nhận diện</h3>
            {recognizedStudents.length === 0 ? (
               <p>Chưa có sinh viên nào được nhận diện.</p>
            ) : (
               recognizedStudents.map((sv, idx) => (
                  <div key={idx} className="student-item">
                     <strong>{sv.student_id} - {sv.student_name}</strong>
                     <small>Thời gian: {new Date(sv.recognized_time || Date.now()).toLocaleTimeString()}</small>
                  </div>
               ))
            )}
         </div>
      </div>
   );

}

export default StreamCamera;