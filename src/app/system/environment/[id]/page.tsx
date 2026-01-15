'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Button, Card, Descriptions, Form, Input, Radio, Select, Space, Switch, Tag, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import apiTestEnvironmentStore, { ApiTestEnvironment } from '@/stores/apiTestEnvironmentStore';

type FormValues = {
  projectId: string;
  systemId: string;
  systemName: string;
  ipAddress: string;
  businessPort: string;
  defaultPath: string;
  isProxy: boolean;
  protocols: string[];
  status: 'active' | 'inactive';
};

const projects = [
  { id: 'p1', name: '示例项目A' },
  { id: 'p2', name: '示例项目B' },
  { id: 'p3', name: '示例项目C' },
];

const protocolOptions = ['HTTP', 'HTTPS', 'WS', 'WSS', 'TCP'].map((value) => ({ value, label: value }));

export default function SystemEnvironmentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = String(params.id);

  const [form] = Form.useForm<FormValues>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const allData = useSyncExternalStore(
    apiTestEnvironmentStore.subscribe,
    apiTestEnvironmentStore.getSnapshot,
    apiTestEnvironmentStore.getSnapshot
  );
  const record: ApiTestEnvironment | undefined = useMemo(() => allData.find((item) => item.id === id), [allData, id]);

  const projectOptions = useMemo(() => projects.map((p) => ({ value: p.id, label: p.name })), []);

  useEffect(() => {
    if (!record) return;
    form.setFieldsValue({
      projectId: record.projectId,
      systemId: record.systemId,
      systemName: record.systemName,
      ipAddress: record.ipAddress,
      businessPort: record.businessPort,
      defaultPath: record.defaultPath,
      isProxy: record.isProxy,
      protocols: record.protocols,
      status: record.status,
    });
  }, [form, record]);

  const handleSave = async () => {
    const values = await form.validateFields();
    const project = projects.find((p) => p.id === values.projectId);
    if (!project) {
      message.error('所属项目无效');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const updated = apiTestEnvironmentStore.update(id, {
        ...values,
        projectName: project.name,
      });
      setSaving(false);
      if (!updated) {
        message.error('记录不存在或已被删除');
        return;
      }
      message.success('保存成功');
      setEditing(false);
    }, 300);
  };

  return (
    <MainLayout title="环境管理">
      <div className="p-4">
        <Card
          bordered={false}
          title="环境详情"
          extra={
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/system/environment')}>
                返回
              </Button>
              {record ? (
                editing ? (
                  <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
                    保存
                  </Button>
                ) : (
                  <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                    编辑
                  </Button>
                )
              ) : null}
            </Space>
          }
          bodyStyle={{ padding: '16px 24px 24px' }}
        >
          {!record ? (
            <div style={{ padding: 24 }}>未找到该环境记录</div>
          ) : (
            <>
              <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="系统ID">{record.systemId}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  {record.status === 'active' ? <Tag color="green">正常</Tag> : <Tag color="red">停用</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="最后更新时间">{record.updatedTime}</Descriptions.Item>
                <Descriptions.Item label="最后更新人">{record.updatedBy}</Descriptions.Item>
              </Descriptions>

              <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                <Form.Item name="projectId" label="所属项目" rules={[{ required: true, message: '请选择所属项目' }]}>
                  <Select placeholder="请选择所属项目" options={projectOptions} disabled={!editing} />
                </Form.Item>
                <Form.Item name="systemId" label="系统ID" rules={[{ required: true, message: '请输入系统ID' }]}>
                  <Input placeholder="请输入系统ID" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="systemName" label="系统名称" rules={[{ required: true, message: '请输入系统名称' }]}>
                  <Input placeholder="请输入系统名称" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="ipAddress" label="IP地址" rules={[{ required: true, message: '请输入IP地址' }]}>
                  <Input placeholder="请输入IP地址" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="businessPort" label="业务端口" rules={[{ required: true, message: '请输入业务端口' }]}>
                  <Input placeholder="请输入业务端口" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="defaultPath" label="默认路径" rules={[{ required: true, message: '请输入默认路径' }]}>
                  <Input placeholder="请输入默认路径" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="isProxy" label="是否代理" valuePropName="checked">
                  <Switch disabled={!editing} />
                </Form.Item>
                <Form.Item name="protocols" label="支持协议" rules={[{ required: true, message: '请选择支持协议' }]}>
                  <Select mode="multiple" placeholder="请选择支持协议" options={protocolOptions} disabled={!editing} />
                </Form.Item>
                <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
                  <Radio.Group disabled={!editing}>
                    <Radio value="active">正常</Radio>
                    <Radio value="inactive">停用</Radio>
                  </Radio.Group>
                </Form.Item>
              </Form>
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}

