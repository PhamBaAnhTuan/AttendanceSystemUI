
'use client';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { API } from '@/constants/api';
import { Button, Table } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
// hooks
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
// utils
import dayjs from 'dayjs';
import { formatDate, formatDateTime, formatTime } from '@/utils/formatTime';
import { recognizedColumns, RecognizedTableType } from '@/components/RecognizedStudentTable';

function StreamCamera() {
   const { token } = useAuth();
   const router = useRouter();
   const searchParams = useSearchParams();
   const sessionID = searchParams.get('sessionID');
   const { showMessage } = useMessageContext();

   const [loading, setLoading] = useState(false)
   const videoRef = useRef<HTMLVideoElement>(null);
   const [isStop, setIsStop] = useState(false);
   const [isCapturing, setIsCapturing] = useState(false);
   const captureLoopRef = useRef(false);

   const [recognizedStudents, setRecognizedStudents] = useState<any[]>([]);

   const log = () => console.log('recog student: ', recognizedStudents)
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
         console.log('post img...')
         const res = await axios.post(
            `${API.ATTENDANCE}${sessionID}/take_attendance/`,
            formData,
            {
               headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  Authorization: `Bearer ${token}` 
            },
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
   };
   // 
   const startCapture = async () => {
      // if (!sessionID || isCapturing) return;
      setIsCapturing(true);
      setIsStop(false);
      captureLoopRef.current = true;
      const loop = async () => {
         if (!captureLoopRef.current || isStop) {
            console.log('⏸️ Đã tạm dừng điểm danh');
            setIsCapturing(false);
            return;
         }

         await captureAndSend();
         setTimeout(loop, 1000); // chờ 1s rồi gọi lại
      };

      loop()
   };
   const stopCapture = () => {
      setIsStop(true)
      captureLoopRef.current = false;
   }
   // End attendance session
   const endAttendanceSession = async () => {
      if (!sessionID) return;

      try {
         const res = await axios.post(
            `${API.ATTENDANCE}${sessionID}/end-session/`,
            { end_session: true },
            {
               headers: { 
                  'ngrok-skip-browser-warning': 'true',
                  Authorization: `Bearer ${token}`
             },
            }
         );
         const data = res.data;
         console.log('End session res: ', data);
         showMessage('success', 'Phiên điểm danh đã kết thúc thành công!');
         router.replace('/attendance/attendance_list');
      } catch (error) {
         console.error('End session error: ', error);
      }
   };

   // 
   const originalData: RecognizedTableType[] = recognizedStudents?.map((attend: any) => {
      return {
         key: attend?.student_id,
         id: attend.student_id,
         fullname: attend.student_name,
         recognized_time: dayjs(attend?.recognized_time).format(formatDateTime)
      }
   })

   return (
      <div className="camera-container">
         <div className="left-panel">
            <h1 className="heading">Điểm danh sinh viên</h1>
            <video ref={videoRef} autoPlay playsInline className="video" />
            <div className="buttonGroup">
               <Button color='primary' variant='outlined' onClick={startCapture} disabled={isCapturing || !sessionID}>
                  <h4>{isCapturing ? 'Đang thực hiện điểm danh...' : 'Bắt đầu điểm danh'}</h4>
               </Button>
               <Button color='danger' variant='outlined' onClick={stopCapture}>
                  <h4>Tạm dừng</h4>
               </Button>
               <Button color='primary' variant='outlined' onClick={endAttendanceSession} disabled={isCapturing}>
                  {/* <Button color='primary' variant='outlined' onClick={log} disabled={isCapturing}> */}
                  <h4>Hoàn thành điểm danh</h4>
               </Button>
            </div>
         </div>

         <aside className="right-panel">
            <h1 className="heading">Danh sách sinh viên đã điểm danh</h1>
            {recognizedStudents.length === 0 ? (
               <p>Chưa có sinh viên nào được điểm danh</p>
            ) : (
               // recognizedStudents.map((sv, idx) => (
               //    <div key={idx} className="student-item">
               //       <h4>{sv.student_id} - {sv.student_name}</h4>
               //       <h5>Thời gian: {dayjs(sv.recognized_time).format(formatDateTime)}</h5>
               //    </div>
               // ))

               <Table<RecognizedTableType>
                  className='student-table'
                  columns={recognizedColumns}
                  dataSource={originalData}
                  size="middle"
                  bordered
                  pagination={false}
                  scroll={{ x: 'max-content', y: 'calc(100vh - 230px)' }}
               />

            )}
         </aside>
      </div >
   );

}

export default StreamCamera;