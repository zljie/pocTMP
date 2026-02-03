'use client';

import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import MainLayout from '@/components/layout/MainLayout';
import { AiResultView } from '@/components/ai/AiResultView';
import { diagnoseError } from '@/lib/ai/client';
import type { AiResult } from '@/lib/ai/types';

const { Title, Text } = Typography;

export default function AiDiagnosisPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initial = useMemo(
    () => ({
      title: '接口异常诊断',
      context: '环境：stj测试；接口：/authsso/login；方法：POST。',
      errorText: '发送请求出错... Connect timed out',
    }),
    []
  );

  const handleRun = async () => {
    setError(null);
    setResult(null);
    const values = form.getFieldsValue();
    const title = values.title as string;
    const context = values.context as string;
    const errorText = values.errorText as string;
    if (!errorText?.trim()) {
      setError('请填写异常文本');
      return;
    }

    setLoading(true);
    const resp = await diagnoseError({ title, context, errorText });
    setLoading(false);
    if ('error' in resp) {
      setError(resp.error.message);
      return;
    }
    setResult(resp.result);
  };

  return (
    <MainLayout title="AI 异常诊断">
      <div className="p-4">
        <Card bordered={false} styles={{ body: { padding: '16px 24px' } }}>
          <Title level={4} style={{ margin: 0 }}>
            智能接口异常诊断
          </Title>
          <Text type="secondary">粘贴报错/日志片段，输出根因分析与排查步骤，生成缺陷草稿。</Text>
        </Card>

        <Card bordered={false} style={{ marginTop: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={form} layout="vertical" initialValues={initial}>
            <Form.Item name="title" label="标题">
              <Input placeholder="例如：登录接口异常诊断" />
            </Form.Item>
            <Form.Item name="context" label="上下文（可选）">
              <Input.TextArea rows={3} placeholder="例如：测试环境/接口名/请求方法/关键参数/执行批次" />
            </Form.Item>
            <Form.Item name="errorText" label="异常文本/日志片段" rules={[{ required: true, message: '请输入异常文本' }]}>
              <Input.TextArea rows={8} placeholder="粘贴报错信息、响应片段、traceId、超时信息等" />
            </Form.Item>

            <Space>
              <Button type="primary" onClick={handleRun} loading={loading}>
                生成诊断
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
            <AiResultView result={result} />
          </Card>
        ) : null}
      </div>
    </MainLayout>
  );
}

