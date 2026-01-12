'use client';

import React, { useEffect, useState } from 'react';
import { Tag } from 'antd';
import { usePathname, useRouter } from 'next/navigation';

interface TagItem {
  key: string;
  label: string;
  closable: boolean;
}

const TagsView: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [tags, setTags] = useState<TagItem[]>([
    { key: '/', label: '首页', closable: false },
  ]);

  // 模拟菜单映射，实际项目中可以从全局状态或 Config 中获取
  // 简单起见，这里硬编码一部分，或者根据 pathname 动态生成
  const getLabelByPath = (path: string) => {
    if (path === '/') return '首页';
    if (path.startsWith('/system/menu')) return '菜单管理';
    if (path.startsWith('/system/user')) return '用户管理';
    if (path.startsWith('/system/role')) return '角色管理';
    if (path.startsWith('/test-cases')) return '测试用例管理';
    // ... 其他映射
    return '未命名页面';
  };

  useEffect(() => {
    const label = getLabelByPath(pathname);
    setTags((prev) => {
      if (prev.some((tag) => tag.key === pathname)) {
        return prev;
      }
      return [...prev, { key: pathname, label, closable: pathname !== '/' }];
    });
  }, [pathname]);

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag.key !== removedTag);
    setTags(newTags);
    
    // 如果关闭的是当前页，跳转到最后一个标签
    if (removedTag === pathname) {
      const lastTag = newTags[newTags.length - 1];
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
          color={pathname === tag.key ? '#1890ff' : 'default'}
          style={{
            cursor: 'pointer',
            padding: '0 12px',
            height: '28px',
            lineHeight: '26px',
            fontSize: '13px',
            borderRadius: '2px',
            border: pathname === tag.key ? 'none' : '1px solid #d9d9d9',
          }}
        >
          {tag.label}
        </Tag>
      ))}
    </div>
  );
};

export default TagsView;
