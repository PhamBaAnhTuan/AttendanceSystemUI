'use client';
import React, { useEffect, useRef, useState } from 'react';
import { API } from '@/constants/api';
import { Button } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import '../student.css';

const url = API.STUDENTS;

const directions = ['Nhìn thẳng vào màn hình', 'Quay sang TRÁI', 'Quay sang PHẢI'];

function StreamCamera() {
   const router = useRouter();
   // 
   const searchParams = useSearchParams();
   const studentId = searchParams.get('id');
   const studentName = searchParams.get('name')?.replace(/\s+/g, '');

   const videoRef = useRef<HTMLVideoElement>(null);
   const [images, setImages] = useState<string[]>([]);
   const [stepIndex, setStepIndex] = useState<number | null>(null);
   const [countdown, setCountdown] = useState(0);
   const [instruction, setInstruction] = useState('');

   useEffect(() => {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
         if (videoRef.current) videoRef.current.srcObject = stream;
      });
   }, []);

   const normalizeDirection = (direction: string): string => {
      switch (direction.trim()) {
         case 'Nhìn thẳng vào màn hình':
            return 'front';
         case 'Quay sang TRÁI':
            return 'left';
         case 'Quay sang PHẢI':
            return 'right';
         default:
            return direction.toLowerCase(); // fallback
      }
   };
   const captureAndSend = async (directions: string) => {

      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      if (!video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const dataURL = canvas.toDataURL('image/jpeg');
      const blob = base64ToBlob(dataURL, 'image/jpeg');

      const normalizedDirect = normalizeDirection(directions);
      const fileName = `${studentName}_${studentId}_${normalizedDirect}.png`;
      const formData = new FormData();
      formData.append('image', blob, fileName);

      await fetch(`${url}upload-image/`, {
         method: 'POST',
         body: formData,
      });

      setImages((prev) => [...prev, dataURL]);
   };

   const startFullCaptureSequence = async () => {
      for (let i = 0; i < directions.length; i++) {
         setInstruction(directions[i]);
         await runCountdown(3); // Đếm ngược 2 giây
         await captureAndSend(directions[i]);
      }

      setInstruction('Đã hoàn tất chụp hình 🎉');
   };
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

   function base64ToBlob(base64Data: string, contentType: string): Blob {
      const byteCharacters = atob(base64Data.split(',')[1]);
      const byteArrays = [];

      for (let i = 0; i < byteCharacters.length; i += 512) {
         const slice = byteCharacters.slice(i, i + 512);
         const byteNumbers = new Array(slice.length);

         for (let j = 0; j < slice.length; j++) {
            byteNumbers[j] = slice.charCodeAt(j);
         }

         const byteArray = new Uint8Array(byteNumbers);
         byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: contentType });
   }


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
            <Button type="primary" onClick={startFullCaptureSequence} disabled={stepIndex !== null}>
               Bắt đầu chụp
            </Button>

            <Button danger onClick={() => router.replace('/student')}>
               Xong
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
