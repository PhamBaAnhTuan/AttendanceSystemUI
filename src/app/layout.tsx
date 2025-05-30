// 'use client'
import '@/styles/globals.css';
import React from 'react';
import { ConfigProvider } from 'antd';
// context
import { RootContextProvider } from '@/context/rootContext';
import { MessageProvider } from '@/context/messageContext';
// components
import { Providers } from '@/components/Providers';
import AuthGate from '../components/AuthGate';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
            <RootContextProvider>
              <MessageProvider>
                <AuthGate>
                  {children}
                </AuthGate>
              </MessageProvider>
            </RootContextProvider>
          </ConfigProvider>
        </Providers>
      </body>
    </html>
  );
}
