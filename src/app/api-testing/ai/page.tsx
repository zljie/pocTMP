'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Row, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';

const { Title, Text } = Typography;

export default function AiHubPage() {
  const router = useRouter();
  const [health, setHealth] = useState<{ ok: boolean; missing: string[] } | null>(null);
  const items = [
    {
      title: 'AI 场景生成',
      desc: '输入接口信息与业务目标，生成场景建议清单。',
      path: '/api-testing/ai/scene-generator',
    },
    {
      title: 'AI 异常诊断',
      desc: '粘贴日志/报错片段，输出根因分析与排查步骤。',
      path: '/api-testing/ai/diagnosis',
    },
    {
      title: 'AI 报告分析',
      desc: '将报告数据粘贴为 JSON，生成摘要、发现项与改进建议。',
      path: '/api-testing/ai/report',
    },
  ];

  useEffect(() => {
    fetch('/api/ai/deepseek/health/')
      .then((r) => r.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ ok: false, missing: ['DEEPSEEK_API_KEY'] }));
  }, []);

  return (
    <MainLayout title="AI能力">
      <div className="p-4">
        <Card bordered={false} styles={{ body: { padding: '16px 24px' } }}>
          <Title level={4} style={{ margin: 0 }}>
            AI 能力中心
          </Title>
          <Text type="secondary">统一入口，便于在接口测试模块内复用。</Text>
        </Card>

        {health && !health.ok ? (
          <Alert
            style={{ marginTop: 12 }}
            type="warning"
            showIcon
            message="检测到 AI 环境变量未配置"
            description={`缺少：${health.missing.join(', ')}。请在项目根目录创建/更新 .env.local 并重启开发服务。`}
          />
        ) : null}

        <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
          {items.map((it) => (
            <Col key={it.path} xs={24} md={8}>
              <Card hoverable onClick={() => router.push(it.path)} bordered={false}>
                <Title level={5} style={{ marginTop: 0 }}>
                  {it.title}
                </Title>
                <Text type="secondary">{it.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </MainLayout>
  );
}
