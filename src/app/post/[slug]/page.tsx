import * as React from 'react';
import { notFound } from 'next/navigation';

export default function PostDetail({ params }: { params: any }) {
   const { slug }: any = React.use(params);
   console.log('slug: ', slug);

   // Giả sử kiểm tra hoặc fetch bài viết từ slug
   if (!slug) return notFound();

   return (
      <div>
         <h1>Chi tiết bài viết: {slug}</h1>
         <p>Nội dung bài viết sẽ được render ở đây...</p>
      </div>
   );
}
