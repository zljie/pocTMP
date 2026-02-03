'use client';

import React, { useMemo, useState } from 'react';
import { Button, Card, Form, Input, Space, Typography, Alert } from 'antd';
import MainLayout from '@/components/layout/MainLayout';
import { AiResultView } from '@/components/ai/AiResultView';
import { analyzeReport } from '@/lib/ai/client';
import type { AiResult } from '@/lib/ai/types';

const { Title, Text } = Typography;

export default function AiReportPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialData = useMemo(
    () => ({
      title: '接口测试报告',
      context: '请输出管理摘要、研发摘要、Top失败原因与改进建议。',
      data: JSON.stringify(
        {
          reportId: 'example',
          testSetName: '权限接口测试',
          totals: { success: 0, failure: 0, exception: 20, skip: 0 },
          details: [
            { name: 'login_登录_正常场景', result: 'Exception', remark: '发送请求出错... Connect timed out' },
          ],
        },
        null,
        2
      ),
    }),
    []
  );

  const handleRun = async () => {
    setError(null);
    setResult(null);
    const values = form.getFieldsValue();
    const title = values.title as string;
    const context = values.context as string;
    const raw = values.data as string;
    let data: unknown = raw;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      setError('数据字段不是合法 JSON');
      return;
    }

    setLoading(true);
    const resp = await analyzeReport({ title, context, data });
    setLoading(false);
    if ('error' in resp) {
      setError(resp.error.message);
      return;
    }
    setResult(resp.result);
  };

  return (
    <MainLayout title="AI 报告分析">
      <div className="p-4">
        <Card bordered={false} styles={{ body: { padding: '16px 24px' } }}>
          <Title level={4} style={{ margin: 0 }}>
            智能测试报告分析/生成
          </Title>
          <Text type="secondary">将报告数据粘贴为 JSON，生成可复制的分析摘要与建议。</Text>
        </Card>

        <Card bordered={false} style={{ marginTop: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={form} layout="vertical" initialValues={initialData}>
            <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
              <Input placeholder="例如：权限接口测试-测试报告" />
            </Form.Item>
            <Form.Item name="context" label="分析目标">
              <Input.TextArea rows={3} placeholder="例如：输出管理摘要、研发摘要、Top失败原因与改进建议" />
            </Form.Item>
            <Form.Item name="data" label="报告数据（JSON）" rules={[{ required: true, message: '请输入 JSON 数据' }]}>
              <Input.TextArea rows={10} placeholder='{"reportId":"...","totals":{...},"details":[...]}' />
            </Form.Item>

            <Space>
              <Button type="primary" onClick={handleRun} loading={loading}>
                生成分析
              </Button>
              <Button
                onClick={() => {
                  form.setFieldsValue(initialData);
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
            <AiResultView result={result} />
          </Card>
        ) : null}
      </div>
    </MainLayout>
  );
}

