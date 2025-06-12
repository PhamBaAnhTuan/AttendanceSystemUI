
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SignInPage from '../app/signin/page';
// context
import { useAuth } from '@/hooks/useAuth';

export default function AuthGate({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const router = useRouter();
   const { isAuthenticated, token } = useAuth();

   useEffect(() => {
      if (!isAuthenticated) return;

      if (!isAuthenticated && !['/signin'].includes(pathname)) {
         router.replace('/signin');
      } else if (isAuthenticated && ['/signin'].includes(pathname)) {
         router.replace('/');
      }
   }, [isAuthenticated, pathname]);

   // if (loading) return <h2>Loading...</h2>;

   if (!isAuthenticated) {
      if (pathname === '/signin') return <SignInPage />;
      return <SignInPage />;
   }

   return <>{children}</>
}