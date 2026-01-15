'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  SearchOutlined,
  ExpandOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { Breadcrumb, Input, Space, Badge, Avatar } from 'antd';
import TagsView from './TagsView';

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
    key: '/tenant',
    icon: <TeamOutlined />,
    label: '租户管理',
    children: [
      { key: '/tenant/tenants', icon: <UserOutlined />, label: '租户管理' },
      { key: '/tenant/packages', icon: <UnorderedListOutlined />, label: '租户套餐管理' },
    ],
  },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/user', icon: <UserOutlined />, label: '用户管理' },
      { key: '/system/role', icon: <TeamOutlined />, label: '角色管理' },
      { key: '/system/menu', icon: <UnorderedListOutlined />, label: '菜单管理' },
      { key: '/system/dept', icon: <PartitionOutlined />, label: '产品管理' },
      { key: '/system/post', icon: <IdcardOutlined />, label: '岗位管理' },
      { key: '/system/dict', icon: <BookOutlined />, label: '字典管理' },
      { key: '/system/config', icon: <ToolOutlined />, label: '参数设置' }
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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    document.title = `${title} - 智能测试平台`;
  }, [title]);

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
  
  const getRootSubmenuKey = (key: string) => {
    const parts = key.split('/').filter(Boolean);
    if (parts.length > 1) return `/${parts[0]}`;
    return undefined;
  };

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const root = getRootSubmenuKey(selectedKey);
    return root ? [root] : [];
  });

  const computedOpenKeys = useMemo(() => {
    const root = getRootSubmenuKey(selectedKey);
    if (!root) return openKeys;
    if (openKeys.includes(root)) return openKeys;
    return [...openKeys, root];
  }, [openKeys, selectedKey]);

  // 生成面包屑项
  const getBreadcrumbItems = () => {
    const pathSnippets = pathname.split('/').filter((i) => i);
    const items = [
      {
        title: <HomeOutlined />,
        href: '/',
      },
    ];

    let currentPath = '';
    pathSnippets.forEach((snippet) => {
      currentPath += `/${snippet}`;
      // 这里应该根据 currentPath 查找菜单名称，简单起见直接用 snippet
      // 实际应递归查找 menuItems
      const findLabel = (items: MenuItem[], path: string): string | undefined => {
        for (const item of items) {
           if (item.key === path) return item.label;
           if (item.children) {
             const label = findLabel(item.children, path);
             if (label) return label;
           }
        }
      };
      
      const label = findLabel(menuItems, currentPath) || snippet;
      items.push({
        title: <span>{label}</span>,
        href: currentPath,
      });
    });
    
    // 如果只有首页，不重复显示
    if (items.length > 1 && items[1].href === '/') {
        items.splice(1, 1);
    }
    
    return items;
  };

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
          {!collapsed && <span>智能测试平台</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={computedOpenKeys}
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
            padding: '0 16px',
            background: 'white',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 50,
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              style: { fontSize: '18px', cursor: 'pointer' },
              onClick: () => setCollapsed(!collapsed),
            })}
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          <Space size="large">
            <Input 
               placeholder="选择租户" 
               suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
               style={{ width: 200, borderRadius: 4 }}
               bordered={false}
            />
            <SearchOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            <ExpandOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            <TranslationOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            <Badge count={5} size="small">
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            </Badge>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#f56a00' }} size="small" />
          </Space>
        </Header>
        
        <TagsView />

        <Content
          style={{
            padding: '16px',
            background: '#f0f2f5',
            overflow: 'auto',
            height: 'calc(100vh - 90px)', // Header 50 + TagsView 40 = 90
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
