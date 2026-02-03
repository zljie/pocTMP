'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '@/components/layout/MainLayout';
import { postJson } from '@/lib/ai/client';

type Scenario = {
  name: string;
  category: 'normal' | 'boundary' | 'exception' | 'auth' | 'idempotency' | 'other';
  requestExample?: string;
  assertions?: string[];
  notes?: string;
};

type Result = {
  summary: string;
  scenarios: Scenario[];
  importHints?: string[];
};

const { Title, Text } = Typography;

export default function AiSceneGeneratorPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initial = useMemo(
    () => ({
      goal: '为登录接口生成覆盖正常/异常/鉴权/边界的测试场景',
      interfaceName: 'login',
      method: 'POST',
      path: '/authsso/login',
      params: JSON.stringify(
        {
          username: 'String',
          password: 'String',
          tenantId: 'String',
        },
        null,
        2
      ),
      context: '系统为后台管理系统；需要覆盖密码错误、账号不存在、缺少参数等。',
    }),
    []
  );

  const columns: ColumnsType<Scenario> = [
    { title: '场景名称', dataIndex: 'name', width: 220, ellipsis: true },
    { title: '类别', dataIndex: 'category', width: 120 },
    { title: '请求示例', dataIndex: 'requestExample', ellipsis: true },
    {
      title: '断言建议',
      dataIndex: 'assertions',
      render: (v: string[] | undefined) => (v?.length ? v.join('；') : '-'),
      ellipsis: true,
    },
    { title: '备注', dataIndex: 'notes', ellipsis: true },
  ];

  const handleRun = async () => {
    setError(null);
    setResult(null);
    const values = form.getFieldsValue();

    let params: unknown = values.params;
    try {
      params = values.params ? JSON.parse(values.params) : {};
    } catch {
      setError('参数字段不是合法 JSON');
      return;
    }

    setLoading(true);
    const resp = await postJson<Result>(
      '/api/ai/interface-testing/scene-generation/',
      {
        goal: values.goal,
        interfaceName: values.interfaceName,
        method: values.method,
        path: values.path,
        params,
        context: values.context,
      },
      undefined
    );
    setLoading(false);

    if ('error' in resp) {
      setError(resp.error.message);
      return;
    }
    setResult(resp.result);
  };

  return (
    <MainLayout title="AI 场景生成">
      <div className="p-4">
        <Card bordered={false} styles={{ body: { padding: '16px 24px' } }}>
          <Title level={4} style={{ margin: 0 }}>
            智能测试场景生成
          </Title>
          <Text type="secondary">输入接口信息与业务目标，生成可导入的场景建议清单。</Text>
        </Card>

        <Card bordered={false} style={{ marginTop: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={form} layout="vertical" initialValues={initial}>
            <Form.Item name="goal" label="业务目标" rules={[{ required: true, message: '请输入业务目标' }]}>
              <Input.TextArea rows={2} placeholder="例如：生成覆盖正常/异常/鉴权/边界的测试场景" />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', gap: 12 }}>
              <Form.Item name="interfaceName" label="接口名（可选）">
                <Input placeholder="例如 login" />
              </Form.Item>
              <Form.Item name="method" label="方法">
                <Select
                  options={[
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' },
                    { label: 'PUT', value: 'PUT' },
                    { label: 'DELETE', value: 'DELETE' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="path" label="路径">
                <Input placeholder="/path/to/api" />
              </Form.Item>
            </div>

            <Form.Item name="params" label="参数（JSON）">
              <Input.TextArea rows={6} placeholder='{"username":"String","password":"String"}' />
            </Form.Item>

            <Form.Item name="context" label="上下文（可选）">
              <Input.TextArea rows={3} placeholder="例如：项目、环境、鉴权方式、依赖接口等" />
            </Form.Item>

            <Space>
              <Button type="primary" onClick={handleRun} loading={loading}>
                生成场景
              </Button>
              <Button
                onClick={() => {
                  form.setFieldsValue(initial);
                  setResult(null);
                  setError(null);
                }}
              >
                重置示例
              </Button>
            </Space>
          </Form>

          {error ? <Alert style={{ marginTop: 12 }} type="error" message={error} showIcon /> : null}
        </Card>

        {result ? (
          <Card bordered={false} style={{ marginTop: 12 }} styles={{ body: { padding: '16px 24px' } }}>
            <div style={{ marginBottom: 12 }}>
              <Text strong>摘要：</Text> <Text>{result.summary}</Text>
            </div>
            <Table rowKey={(r) => `${r.category}-${r.name}`} columns={columns} dataSource={result.scenarios} pagination={{ pageSize: 10 }} />
            {result.importHints?.length ? (
              <div style={{ marginTop: 12 }}>
                <Text strong>导入提示：</Text>
                <ul style={{ margin: '6px 0 0 18px' }}>
                  {result.importHints.map((x, idx) => (
                    <li key={idx}>
                      <Text type="secondary">{x}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        ) : null}
      </div>
    </MainLayout>
  );
}

