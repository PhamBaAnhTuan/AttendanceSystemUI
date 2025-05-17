// 'use client';

// import { useEffect, useState } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// // hook
// import { useAuth } from '@/hooks/useAuth';
// // components
// import SignInPage from '../app/signin/page';
// import SignUpPage from '../app/signup/page';

// export default function AuthGate({ children }: { children: React.ReactNode }) {
//    const pathname = usePathname();
//    const router = useRouter();
//    const { loading, isAuthenticated } = useAuth();

//    useEffect(() => {
//       // if (loading) return;

//       if (!isAuthenticated && !['/signin', '/signup'].includes(pathname)) {
//          router.replace('/signin');
//       } else if (isAuthenticated && ['/signin', '/signup'].includes(pathname)) {
//          router.replace('/');
//       }
//    }, [isAuthenticated, loading, pathname]);

//    if (loading) return <h2>Loading...</h2>;

//    if (isAuthenticated && ['/signin', '/signup'].includes(pathname)) {
//       if (typeof window !== 'undefined') {
//          router.replace('/');
//       }
//       return null;
//    }

//    return <>{children}</>;
// }

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SignInPage from '../app/signin/page';
import SignUpPage from '../app/signup/page';

export default function AuthGate({ children }: { children: React.ReactNode }) {
   // const pathname = usePathname();
   const router = useRouter();
   // const { loading, isAuthenticated } = useAuth();
   const pathname = '/'
   const isAuthenticated = true
   const loading = false

   useEffect(() => {
      if (loading) return;
      if (!isAuthenticated) return;

      if (!isAuthenticated && !['/signin', '/signup'].includes(pathname)) {
         router.replace('/signin');
      } else if (isAuthenticated && ['/signin', '/signup'].includes(pathname)) {
         router.replace('/');
      }
   }, [isAuthenticated, loading, pathname]);

   // if (loading) return <h2>Loading...</h2>;

   if (!isAuthenticated) {
      if (pathname === '/') return <SignInPage />;
      if (pathname === '/signup') return <SignUpPage />;
      return <SignInPage />;
   }

   return <>{children}</>;
}