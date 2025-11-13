import React,
{ useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import './CustomStyles.css';
import {
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ApartmentOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import dutLogo from './dut.jpg'; // Đảm bảo bạn đã import logo

const { Header, Content, Sider } = Layout;

// Menu items (Giữ nguyên)
const menuItems = [
  { key: '/nguoi-dung', icon: <UserOutlined />, label: <Link to="/nguoi-dung">Người dùng</Link> },
  {
    key: 'sub-lich-tuan', 
    icon: <CalendarOutlined />,
    label: 'Lịch Tuần',
    children: [
      { key: '/', label: <Link to="/">Đăng ký lịch tuần</Link> }, 
      { key: '/quan-ly', label: <Link to="/quan-ly">Quản lý lịch tuần</Link> }, 
      { key: '/dia-diem', icon: <EnvironmentOutlined />, label: <Link to="/dia-diem">Địa điểm</Link> }, 
    ],
  },
  { key: '/khoa-phong', icon: <ApartmentOutlined />, label: <Link to="/khoa-phong">Khoa và phòng ban</Link> },
];

const MainLayout = () => {
  // Trạng thái đóng là mặc định (true)
  const [collapsed, setCollapsed] = useState(true); 
  const location = useLocation();

  // --- LOGIC 'openKey' ĐÃ BỊ XÓA ---

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        backgroundColor: '#ffD700', 
        display: 'flex', 
        alignItems: 'center',
        color: '#000',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)} 
            style={{ color: '#000', fontSize: '18px', marginRight: '16px' }}
          />
          <img src={dutLogo} alt="DUT Logo" style={{ height: '40px', marginRight: '10px' }} />
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0056b3' }}>
            DUT
          </span>
        </div>
        <div>Thông tin người dùng (Dao Duy Tuan...)</div>
      </Header>

      <Layout>
        <Sider 
          width={250} 
          className="custom-sider"
          collapsible
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          trigger={null} 
          collapsedWidth={0} 
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]} 
            // --- 'defaultOpenKeys' ĐÃ BỊ XÓA ---
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>

        <Layout style={{ background: '#fff', padding: '16px' }}>
          <Content style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: '#fff', 
          }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;