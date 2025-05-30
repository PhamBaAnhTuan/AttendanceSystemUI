'use client';
import React, { useEffect, useRef, useState } from 'react';
// import '../teacher.css';
import { API } from '@/constants/api';
import { Button } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { postImgAction } from '@/services/mainService';
import axios from 'axios';

const directions = ['Nhìn thẳng vào màn hình', 'Quay sang TRÁI', 'Quay sang PHẢI'];

function StreamCamera() {
   const { token } = useAuth();
   const router = useRouter();

   const searchParams = useSearchParams();
   const teacherID = searchParams.get('id');
   const teacherName = searchParams.get('fullname')?.replace(/\s+/g, '');

   const videoRef = useRef<HTMLVideoElement>(null);
   const [images, setImages] = useState<string[]>([]);
   const [instruction, setInstruction] = useState('');
   const [countdown, setCountdown] = useState(0);
   const [isCapturing, setIsCapturing] = useState(false);

   // Mở camera
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
   }, []);

   // Chuyển từ tiếng Việt sang dạng chuẩn
   const normalizeDirection = (direction: string): string => {
      switch (direction.trim()) {
         case 'Nhìn thẳng vào màn hình': return 'front';
         case 'Quay sang TRÁI': return 'left';
         case 'Quay sang PHẢI': return 'right';
         default: return direction.toLowerCase();
      }
   };

   // Hàm base64 → blob dùng fetch
   const base64ToBlob = async (base64Data: string): Promise<Blob> => {
      const res = await fetch(base64Data);
      return await res.blob();
   };

   // Chụp ảnh và gửi về server
   const captureAndSend = async (direction: string) => {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      if (!video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const dataURL = canvas.toDataURL('image/png');
      const blob = await base64ToBlob(dataURL);

      const normalized = normalizeDirection(direction);
      const fileName = `Teacher_${teacherName}_${normalized}.png`;

      const imgForm = new FormData();
      imgForm.append('image', blob, fileName);

      await axios.post(`${API.TEACHERS}upload-image/`, imgForm, {
         headers: {
            'Authorization': `Bearer ${token}`
         }
      })
      setImages((prev) => [...prev, dataURL]);
   };

   // Đếm ngược
   const runCountdown = (seconds: number): Promise<void> => {
      return new Promise((resolve) => {
         let counter = seconds;
         setCountdown(counter);
         const countdownInterval = setInterval(() => {
            counter--;
            setCountdown(counter);
            if (counter <= 0) {
               clearInterval(countdownInterval);
               resolve();
            }
         }, 1000);
      });
   };

   // Tiến trình chụp toàn bộ
   const startFullCaptureSequence = async () => {
      setIsCapturing(true);
      for (let i = 0; i < directions.length; i++) {
         const dir = directions[i];
         setInstruction(dir);
         await new Promise(res => setTimeout(res, 500)); // Cho UI kịp cập nhật
         await runCountdown(3);
         await captureAndSend(dir);
      }
      setInstruction('Đã hoàn tất chụp hình 🎉');
      setIsCapturing(false);
   };

   return (
      <div className='camera-container'>
         <h1 className='heading'>Hướng dẫn chụp ảnh giáo viên</h1>
         <video ref={videoRef} autoPlay playsInline className='video' />

         {instruction && (
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 500, color: '#555' }}>
               👉 {instruction} {countdown > 0 && `(chụp sau ${countdown}s)`}
            </div>
         )}

         <div className='buttonGroup'>
            <Button type="primary" onClick={startFullCaptureSequence} disabled={isCapturing}>
               <h4>{isCapturing ? 'Đang chụp...' : 'Bắt đầu chụp'}</h4>
            </Button>
            <Button danger onClick={() => router.replace('/teacher')} disabled={isCapturing}>
               <h4>Xong</h4>
            </Button>
         </div>

         {images.length > 0 && (
            <div className='imageList'>
               <h2 className='imageListTitle'>Ảnh đã chụp:</h2>
               <div className='imageGrid'>
                  {images.map((img, idx) => (
                     <img key={idx} src={img} className='imageItem' alt={`capture-${idx}`} />
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}

export default StreamCamera;
