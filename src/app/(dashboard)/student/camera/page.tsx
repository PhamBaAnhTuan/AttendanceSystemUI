'use client';
import React, { useEffect, useRef, useState } from 'react';
import '../student.css';
import { API, API_BASE } from '@/constants/api';
import { Button, message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useDispatch';
import { postImgAction } from '@/services/mainService';
import axios from 'axios';

const directions = ['Nhìn thẳng vào màn hình', 'Quay sang TRÁI', 'Quay sang PHẢI', '4', '5'];

function StreamCamera() {
   const { token } = useAuth();
   const router = useRouter();

   const searchParams = useSearchParams();
   const classID = searchParams.get('class_id');
   const studentID = searchParams.get('id');
   const studentName = searchParams.get('name')?.replace(/\s+/g, '');

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

   const captureImage = async (direction: string): Promise<{ blob: Blob; fileName: string }> => {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      if (!video) throw new Error('Video element not found');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const dataURL = canvas.toDataURL('image/png');
      const blob = await base64ToBlob(dataURL);

      const normalized = normalizeDirection(direction);
      const fileName = `Student_${studentID}_${studentName}_${normalized}.png`;

      return { blob, fileName };
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

   const sendAllImages = async (images: { blob: Blob; fileName: string }[]) => {
      const formData = new FormData();

      images.forEach((image, index) => {
         formData.append(`image${index + 1}`, image.blob, image.fileName);
      });
      for (const [key, value] of formData.entries()) {
         console.log(`🔥${key}:`, value);
      }

      try {
         const res = await axios.post(`${API_BASE}/face_recog/face/train/`, formData, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });
         const data = res.data
         if (data) {
            message.success(data?.message)
            console.log('All images uploaded successfully');
         }
      } catch (error) {
         console.error('Error uploading images:', error);
         throw error;
      }
   };

   const startFullCaptureSequence = async () => {
      setIsCapturing(true);
      const capturedImages: { blob: Blob; fileName: string }[] = [];

      try {
         for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            setInstruction(dir);
            await new Promise(res => setTimeout(res, 500));
            await runCountdown(3);

            const image = await captureImage(dir);
            capturedImages.push(image);
            setImages(prev => [...prev, URL.createObjectURL(image.blob)]);
         }

         await sendAllImages(capturedImages);
         setInstruction('Đã hoàn tất chụp hình 🎉');
      } catch (error) {
         console.error('Error during capture sequence:', error);
         setInstruction('Có lỗi xảy ra, vui lòng thử lại');
      } finally {
         setIsCapturing(false);
      }
   };

   return (
      <div className='camera-container'>
         <h1 className='heading'>Hướng dẫn chụp ảnh sinh viên</h1>
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
            <Button danger onClick={() => router.replace('/student')} disabled={isCapturing}>
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
