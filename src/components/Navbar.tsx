'use client';

import { Layout, Menu } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HomeOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

const { Header } = Layout;
const Navbar = () => {
  const { isAuthenticated, user, token } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  // const isAuthenticated = false

  const selectedKey = (() => {
    if (pathname === '/') return 'home';
    if (pathname.includes('/signin')) return 'signin';
    if (pathname.includes('/signup')) return 'signup';
    return '';
  })();

  return (
    <Layout>
      <Header style={{ backgroundColor: '#001529' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          {isAuthenticated && isAuthenticated ?
          
          <div>
            <Menu.Item key="home" icon={<HomeOutlined />}>
            <Link href="/">Trang chủ</Link>
          </Menu.Item>
          <Menu.Item key="signup" icon={<UserAddOutlined />}>
            <Link href="/signup">Diem Danh</Link>
          </Menu.Item>
          <Menu.Item key="signup" icon={<UserAddOutlined />}>
            <Link href="/signup">Them giao vien</Link>
          </Menu.Item>
          <Menu.Item key="signup" icon={<UserAddOutlined />}>
            <Link href="/signup">Them Sinh Vien</Link>
          </Menu.Item>
          <Menu.Item key="signup" icon={<UserAddOutlined />}>
            <Link href="/signup">Them Mon Hoc</Link>
          </Menu.Item>
          <Menu.Item key="signup" icon={<UserAddOutlined />}>
            <Link href="/signup">Them Lop Hoc</Link>
          </Menu.Item>
          <Menu.Item key="signup" icon={<UserAddOutlined />}>
            <Link href="/signup">Them Phong Hoc</Link>
          </Menu.Item>
          </div>
:<div>
          <Menu.Item key="signin" icon={<LoginOutlined />}>
            <Link href="/signin">Đăng nhập</Link>
          </Menu.Item>
          <Menu.Item key="signup" icon={<UserAddOutlined />}>
            <Link href="/signup">Đăng ký</Link>
          </Menu.Item></div>}
        </Menu>
      </Header>
    </Layout>
  );
};

export default Navbar;
