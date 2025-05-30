
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SignInPage from '../app/signin/page';
import SignUpPage from '../app/signup/page';
import { ConfigProvider } from 'antd';
// context
import { useAuth } from '@/hooks/useAuth';
import { RootContextProvider } from '@/context/rootContext';
// components
import { Providers } from '@/components/Providers';

export default function AuthGate({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const router = useRouter();
   const { isAuthenticated, isAdmin } = useAuth();

   useEffect(() => {
      if (!isAuthenticated) return;
      console.log(
         'isAuthenticated: ', isAuthenticated,
         '\nisAdmin: ', isAdmin
      )

      if (!isAuthenticated && !['/signin', '/signup'].includes(pathname)) {
         router.replace('/signin');
      } else if (isAuthenticated && ['/signin', '/signup'].includes(pathname)) {
         router.replace('/');
      }
   }, [isAuthenticated, pathname]);

   // if (loading) return <h2>Loading...</h2>;

   if (!isAuthenticated) {
      if (pathname === '/signin') return <SignInPage />;
      if (pathname === '/signup') return <SignUpPage />;
      return <SignInPage />;
   }

   return <>{children}</>
}