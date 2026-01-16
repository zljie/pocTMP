'use client';

import React from 'react';
import { Button, Result, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';

export type UnderConstructionProps = {
  pageTitle?: string;
};

export default function UnderConstruction({ pageTitle }: UnderConstructionProps) {
  const router = useRouter();

  return (
    <Result
      status="info"
      title={pageTitle ? `${pageTitle}（开发中）` : '当前页面正在开发中'}
      subTitle="我们正在加紧开发该功能，敬请期待。"
      extra={
        <Space>
          <Button onClick={() => router.back()}>返回上一页</Button>
          <Button type="primary" onClick={() => router.push('/')}>
            返回首页
          </Button>
        </Space>
      }
    >
      <Typography.Paragraph style={{ marginBottom: 0, textAlign: 'center' }}>
        如需优先上线或调整范围，可在需求中注明使用场景与关键流程。
      </Typography.Paragraph>
    </Result>
  );
}

