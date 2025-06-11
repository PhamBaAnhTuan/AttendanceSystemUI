'use client';
import React, { useEffect, useRef, useState } from 'react';

import { API, API_BASE } from '@/constants/api';
import { Button } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMessageContext } from '@/context/messageContext';
import axios from 'axios';

const directions = ['Nhìn thẳng vào màn hình 1', 'Nhìn thẳng vào màn hình 2', 'Nhìn thẳng vào màn hình 3', 'Quay sang TRÁI', 'Quay sang PHẢI'];

function StreamCamera() {
   const { token, info } = useAuth();
   const router = useRouter();

   const searchParams = useSearchParams();
   const ID = searchParams.get('id');
   const role = searchParams.get('role')
   const fullName = searchParams.get('fullname')?.replace(/\s+/g, '');
   const API_URL = role === 'teacher' ? API.TEACHERS : API.STUDENTS;

   const videoRef = useRef<HTMLVideoElement>(null);
   const [images, setImages] = useState<string[]>([]);
   const [instruction, setInstruction] = useState('');
   const [countdown, setCountdown] = useState(0);
   const [isCapturing, setIsCapturing] = useState(false);

   const { showMessage } = useMessageContext();

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
         case 'Nhìn thẳng vào màn hình 1': return 'front1';
         case 'Nhìn thẳng vào màn hình 2': return 'front2';
         case 'Nhìn thẳng vào màn hình 3': return 'front3';
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
      const fileName = `${ID}_${fullName}_${normalized}.png`;

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
         }, 2000);
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
         const res = await axios.post(`${API.FACE_TRAINING}train/`, formData, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });
         const data = res.data
         if (data) {
            showMessage('success', 'Tất cả ảnh đã được tải lên thành công!');
         }
      } catch (error: any) {
         const errorData = error?.response?.data?.error
         console.error('Error uploading images: ', errorData);
         console.error('Error: ', error?.response?.data);
         if (errorData === 'No valid face encodings could be extracted from any images') {
            showMessage('error', 'Không nhận diện được khuôn mặt!\nVui lòng chụp lại rõ nét hơn!');
         }
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
            await runCountdown(1);

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
      <div className='left-panel'>
         <h1 className='heading'>Hướng dẫn chụp ảnh {role === 'teacher' ? 'Giáo viên' : 'Sinh viên'}</h1>
         <video ref={videoRef} autoPlay playsInline className='video' />

         {instruction && (
            <div style={{ fontSize: 18, fontWeight: 500, color: '#555' }}>
               👉 {instruction} {countdown > 0 && `(chụp sau ${countdown}s)`}
            </div>
         )}

         <div className='buttonGroup'>
            <Button color='primary' variant='outlined' onClick={startFullCaptureSequence} disabled={isCapturing}>
               <h4>{isCapturing ? 'Đang chụp...' : 'Bắt đầu chụp'}</h4>
            </Button>
            <Button color='danger' variant='outlined' onClick={() => router.replace(`/${role}`)} disabled={isCapturing}>
               <h4>Xong</h4>
            </Button>
         </div>

         {images.length > 0 && (
            <div className='imageList'>
               <h4 style={{ marginTop: '10px' }} >Ảnh đã chụp:</h4>
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