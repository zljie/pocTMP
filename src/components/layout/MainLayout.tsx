'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  GlobalOutlined,
  DashboardOutlined,
  ApiOutlined,
  CheckSquareOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/test-cases', icon: <FileTextOutlined />, label: '测试用例管理' },
  { key: '/test-requirements', icon: <UnorderedListOutlined />, label: '测试需求管理' },
  { key: '/test-plans', icon: <CalendarOutlined />, label: '测试计划管理' },
  { key: '/test-execution', icon: <PlayCircleOutlined />, label: '测试执行管理' },
  { key: '/test-reports', icon: <BarChartOutlined />, label: '测试报告管理' },
  { key: '/web-automation', icon: <GlobalOutlined />, label: 'Web自动化测试' },
  { key: '/performance', icon: <DashboardOutlined />, label: '性能测试' },
  { key: '/api-testing', icon: <ApiOutlined />, label: '接口测试' },
  { key: '/task-management', icon: <CheckSquareOutlined />, label: '测试任务管理' },
];

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState('--:--');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={220}
        style={{
          background: '#1a3a5f',
          boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            padding: collapsed ? '20px 0' : '20px 15px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            borderBottom: '1px solid #2a4a6f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px',
          }}
        >
          <RobotOutlined style={{ color: '#4dabf7', fontSize: '24px' }} />
          {!collapsed && <span>自动化测试管理平台</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{
            background: '#1a3a5f',
            borderRight: 0,
            marginTop: '20px',
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 25px',
            background: 'white',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              style: { fontSize: '18px', cursor: 'pointer' },
              onClick: () => setCollapsed(!collapsed),
            })}
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#1a3a5f' }}>
              {title}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666' }}>
            <UserOutlined />
            <span>管理员</span>
            <span>{currentTime}</span>
          </div>
        </Header>
        <Content
          style={{
            padding: '20px',
            background: '#f5f7fa',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
