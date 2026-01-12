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
  SettingOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  PartitionOutlined,
  IdcardOutlined,
  BookOutlined,
  ToolOutlined,
  BellOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Sider, Header, Content } = Layout;

// 定义菜单项类型
interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/user', icon: <UserOutlined />, label: '用户管理' },
      { key: '/system/role', icon: <TeamOutlined />, label: '角色管理' },
      { key: '/system/menu', icon: <UnorderedListOutlined />, label: '菜单管理' },
      { key: '/system/dept', icon: <PartitionOutlined />, label: '部门管理' },
      { key: '/system/post', icon: <IdcardOutlined />, label: '岗位管理' },
      { key: '/system/dict', icon: <BookOutlined />, label: '字典管理' },
      { key: '/system/config', icon: <ToolOutlined />, label: '参数设置' },
      { key: '/system/notice', icon: <BellOutlined />, label: '通知公告' },
      { key: '/system/log', icon: <SafetyCertificateOutlined />, label: '日志管理' },
      { key: '/system/file', icon: <FileOutlined />, label: '文件管理' },
    ],
  },
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

  // 计算当前选中的菜单 Key
  // 1. 处理 trailingSlash (例如 /test-cases/ 应匹配 /test-cases)
  // 2. 支持子路由高亮 (例如 /test-cases/add 应匹配 /test-cases)
  const getSelectedKey = () => {
    // 移除末尾斜杠（除了根路径）
    const normalizedPath = pathname !== '/' && pathname.endsWith('/') 
      ? pathname.slice(0, -1) 
      : pathname;

    // 优先精确匹配
    const findKey = (items: MenuItem[], path: string): string | null => {
      for (const item of items) {
        if (item.key === path) return item.key;
        if (item.children) {
          const childKey = findKey(item.children, path);
          if (childKey) return childKey;
        }
      }
      return null;
    };

    if (findKey(menuItems, normalizedPath)) {
      return normalizedPath;
    }

    // 其次前缀匹配（排除首页 '/'，防止所有路径都匹配首页）
    // 递归查找前缀匹配
    const findPrefixMatch = (items: MenuItem[], path: string): string | null => {
      for (const item of items) {
        if (item.key !== '/' && path.startsWith(item.key)) {
           // 如果有子菜单，继续在子菜单中找更长的匹配，或者直接返回当前key
           // 简单的做法是：如果有子菜单，可能匹配到子菜单的某一项，也可能就是父菜单
           // 这里我们简单处理：只要匹配到就返回。但要注意 /system/user/add 应该匹配 /system/user 而不是 /system
           // 所以应该先递归找子菜单
           if (item.children) {
             const childMatch = findPrefixMatch(item.children, path);
             if (childMatch) return childMatch;
           }
           return item.key;
        }
        if (item.children) {
          const childMatch = findPrefixMatch(item.children, path);
          if (childMatch) return childMatch;
        }
      }
      return null;
    };

    const prefixMatch = findPrefixMatch(menuItems, normalizedPath);
    
    return prefixMatch || '/';
  };

  const selectedKey = getSelectedKey();
  
  // 维护 openKeys 状态
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // 当 selectedKey 变化时，自动展开对应的父菜单
  useEffect(() => {
    const parts = selectedKey.split('/').filter(Boolean);
    if (parts.length > 1) {
      // 假设第一级目录就是根路径下的一级，如 /system
      const rootSubmenuKey = `/${parts[0]}`;
      setOpenKeys((prev) => {
        // 如果已经展开了，就不变；否则添加
        if (prev.includes(rootSubmenuKey)) return prev;
        return [...prev, rootSubmenuKey];
      });
    }
  }, [selectedKey]);

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
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
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
