// 'use client'
import '@/styles/globals.css';
import React from 'react';
import { ConfigProvider } from 'antd';
// context
import { MessageProvider } from '@/context/messageContext';
// components
import { Providers } from '@/components/Providers';
import AuthGate from '../components/AuthGate';
import '@ant-design/v5-patch-for-react-19';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
            <MessageProvider>
              <AuthGate>
                {children}
              </AuthGate>
            </MessageProvider>
          </ConfigProvider>
        </Providers>
      </body>
    </html>
  );
}
