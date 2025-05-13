'use client'
import '@ant-design/v5-patch-for-react-19';
import '@/styles/globals.css';
import { ConfigProvider } from 'antd';
// context
import { RootContextProvider } from '@/context/RootContext';
// components
import { Providers } from '@/components/Providers';
import AuthGate from '../components/AuthGate';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
          <Providers>
            <RootContextProvider>
              <AuthGate>{children}</AuthGate>
            </RootContextProvider>
          </Providers>
        </ConfigProvider>
      </body>
    </html>
  );
}
