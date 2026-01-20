'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { Tag } from 'antd';
import { usePathname, useRouter } from 'next/navigation';

interface TagItem {
  key: string;
  label: string;
  closable: boolean;
}

const normalizePath = (path: string) => {
  if (path === '/') return '/';
  return path.endsWith('/') ? path.slice(0, -1) : path;
};

const tagsStore = (() => {
  let tags: TagItem[] = [{ key: '/', label: '首页', closable: false }];
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getSnapshot = () => tags;

  const ensure = (path: string, label: string) => {
    if (tags.some((t) => t.key === path)) return;
    tags = [...tags, { key: path, label, closable: path !== '/' }];
    emit();
  };

  const remove = (path: string) => {
    if (!tags.some((t) => t.key === path)) return;
    tags = tags.filter((t) => t.key !== path);
    if (!tags.length) tags = [{ key: '/', label: '首页', closable: false }];
    emit();
  };

  return { subscribe, getSnapshot, ensure, remove };
})();

const getLabelByPath = (path: string) => {
  const normalizedPath = normalizePath(path);

  if (path === '/') return '首页';
  if (normalizedPath.startsWith('/tenant/tenants')) return '租户管理';
  if (normalizedPath.startsWith('/tenant/packages')) return '租户套餐管理';
  if (normalizedPath.startsWith('/system/user')) return '用户管理';
  if (normalizedPath.startsWith('/system/role')) return '角色管理';
  if (normalizedPath.startsWith('/system/menu')) return '菜单管理';
  if (normalizedPath.startsWith('/system/dept')) return '产品管理';
  if (normalizedPath.startsWith('/system/post')) return '岗位管理';
  if (normalizedPath.startsWith('/system/dict')) return '字典管理';
  if (normalizedPath.startsWith('/system/config')) return '参数设置';
  if (normalizedPath.startsWith('/system/service-config')) return '服务配置管理';
  if (normalizedPath.startsWith('/system/environment')) return '环境管理';
  if (normalizedPath.startsWith('/test-cases')) return '测试用例管理';
  if (normalizedPath.startsWith('/test-requirements')) return '测试需求管理';
  if (normalizedPath.startsWith('/test-plans')) return '测试计划管理';
  if (normalizedPath.startsWith('/test-execution')) return '测试执行管理';
  if (normalizedPath.startsWith('/test-reports')) return '测试报告管理';
  if (normalizedPath.startsWith('/web-automation')) return 'Web自动化测试';
  if (normalizedPath.startsWith('/performance')) return '性能测试';
  if (normalizedPath.startsWith('/api-testing/interface')) return '接口管理';
  if (normalizedPath.startsWith('/api-testing/message')) return '报文管理';
  if (normalizedPath.startsWith('/api-testing/scene')) return '场景管理';
  if (normalizedPath.startsWith('/api-testing')) return '接口测试';
  if (normalizedPath.startsWith('/task-management')) return '测试任务管理';
  if (normalizedPath.startsWith('/building')) return '开发中';
  return '未命名页面';
};

const TagsView: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const normalizedPathname = normalizePath(pathname);

  const tags = useSyncExternalStore(tagsStore.subscribe, tagsStore.getSnapshot, tagsStore.getSnapshot);

  useEffect(() => {
    tagsStore.ensure(normalizedPathname, getLabelByPath(normalizedPathname));
  }, [normalizedPathname]);

  const handleClose = (removedTag: string) => {
    tagsStore.remove(removedTag);
    
    // 如果关闭的是当前页，跳转到最后一个标签
    if (removedTag === normalizedPathname) {
      const nextTags = tagsStore.getSnapshot();
      const lastTag = nextTags[nextTags.length - 1] || { key: '/', label: '首页', closable: false };
      router.push(lastTag.key);
    }
  };

  const handleClick = (key: string) => {
    router.push(key);
  };

  return (
    <div
      style={{
        padding: '6px 16px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
      }}
    >
      {tags.map((tag) => (
        <Tag
          key={tag.key}
          closable={tag.closable}
          onClose={(e) => {
            e.preventDefault();
            handleClose(tag.key);
          }}
          onClick={() => handleClick(tag.key)}
          color={normalizedPathname === tag.key ? '#1890ff' : 'default'}
          style={{
            cursor: 'pointer',
            padding: '0 12px',
            height: '28px',
            lineHeight: '26px',
            fontSize: '13px',
            borderRadius: '2px',
            border: normalizedPathname === tag.key ? 'none' : '1px solid #d9d9d9',
          }}
        >
          {tag.label}
        </Tag>
      ))}
    </div>
  );
};

export default TagsView;
