'use client';
import React, { useEffect, useRef, useState } from 'react';
import { API } from '@/constants/api';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

function StreamCamera() {
   const { token } = useAuth();
   const router = useRouter();
   const videoRef = useRef<HTMLVideoElement>(null);

   const [images, setImages] = useState<string[]>([]);
   const [isCapturing, setIsCapturing] = useState(false);
   const [instruction, setInstruction] = useState('');
   const [sessionId, setSessionId] = useState<string | null>(null);
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

      const createAttendanceSession = async () => {
         try {
            const res = await axios.post(`${API.ATTENDANCE}attendance/`, {}, {
               headers: { Authorization: `Bearer ${token}` }
            });
            setSessionId(res.data?.id);
         } catch (err) {
            console.error('Không thể tạo session điểm danh:', err);
         }
      };

      startCamera();
      createAttendanceSession();

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
      if (!sessionId) return;

      const formData = new FormData();
      formData.append('image', imageBlob);

      try {
         const res = await axios.post(
            `${API.ATTENDANCE}attendance/${sessionId}/take_attendance/`,
            formData,
            {
               headers: { Authorization: `Bearer ${token}` },
            }
         );

         if (res.data?.student) {
            setRecognizedStudents((prev) => [...prev, res.data.student]);
         }
      } catch (error) {
         console.error('Lỗi gửi ảnh lên nhận diện:', error);
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
      if (!sessionId) return;
      setIsCapturing(true);
      for (let i = 0; i < directions.length; i++) {
         setInstruction(directions[i]);
         await new Promise(res => setTimeout(res, 800));
         await captureAndSend();
      }
      setInstruction('✅ Đã hoàn tất điểm danh');
      setIsCapturing(false);
   };

   return (
      <div className='camera-container'>
         <h1 className='heading'>Điểm danh sinh viên</h1>
         <video ref={videoRef} autoPlay playsInline className='video' />

         <div style={{ marginTop: 16, fontSize: 18, fontWeight: 500, color: '#555' }}>
            {sessionId
               ? instruction || 'Đã sẵn sàng điểm danh'
               : '⏳ Đang tạo phiên điểm danh...'}
         </div>

         <div className='buttonGroup' style={{ marginTop: 24 }}>
            <Button type="primary" onClick={startFullCaptureSequence} disabled={isCapturing || !sessionId}>
               <h4>{isCapturing ? 'Đang chụp...' : 'Bắt đầu chụp'}</h4>
            </Button>
            <Button danger onClick={() => router.replace('/')} disabled={isCapturing}>
               <h4>Thoát</h4>
            </Button>
         </div>

         {images.length > 0 && (
            <div className='imageList'>
               <h3>Ảnh đã chụp:</h3>
               <div className='imageGrid'>
                  {images.map((img, idx) => (
                     <img key={idx} src={img} className='imageItem' alt={`capture-${idx}`} />
                  ))}
               </div>
            </div>
         )}

         {recognizedStudents.length > 0 && (
            <div style={{ marginTop: 20 }}>
               <h3>✅ Danh sách sinh viên đã điểm danh:</h3>
               <ul>
                  {recognizedStudents.map((sv, idx) => (
                     <li key={idx}>
                        {sv.name} - {sv.student_id}
                     </li>
                  ))}
               </ul>
            </div>
         )}
      </div>
   );
}

export default StreamCamera;
