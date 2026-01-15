'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Button, Card, Descriptions, Form, Input, Radio, Select, Space, Tag, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import serviceConfigStore, { ServiceConfig } from '@/stores/serviceConfigStore';

type FormValues = {
  addressName: string;
  address: string;
  cliServer: string;
  adminToken: string;
  scanUser: string;
  scanUserPassword: string;
  scanUserEmail: string;
  projectId: string;
  status: 'active' | 'inactive';
};

const projects = [
  { id: 'p1', name: '示例项目A' },
  { id: 'p2', name: '示例项目B' },
  { id: 'p3', name: '示例项目C' },
];

export default function ServiceConfigDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = String(params.id);

  const [form] = Form.useForm<FormValues>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const allData = useSyncExternalStore(serviceConfigStore.subscribe, serviceConfigStore.getSnapshot, serviceConfigStore.getSnapshot);
  const record: ServiceConfig | undefined = useMemo(() => allData.find((item) => item.id === id), [allData, id]);

  const projectOptions = useMemo(() => projects.map((p) => ({ value: p.id, label: p.name })), []);

  useEffect(() => {
    if (!record) return;
    form.setFieldsValue({
      addressName: record.addressName,
      address: record.address,
      cliServer: record.cliServer,
      adminToken: record.adminToken,
      scanUser: record.scanUser,
      scanUserPassword: record.scanUserPassword,
      scanUserEmail: record.scanUserEmail,
      projectId: record.projectId,
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
      const updated = serviceConfigStore.update(id, {
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
    <MainLayout title="服务配置管理">
      <div className="p-4">
        <Card
          bordered={false}
          title="服务配置详情"
          extra={
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/system/service-config')}>
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
            <div style={{ padding: 24 }}>未找到该服务配置记录</div>
          ) : (
            <>
              <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  {record.status === 'active' ? <Tag color="green">正常</Tag> : <Tag color="red">停用</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="最后更新时间">{record.updatedTime}</Descriptions.Item>
                <Descriptions.Item label="最后更新人">{record.updatedBy}</Descriptions.Item>
              </Descriptions>

              <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                <Form.Item name="addressName" label="地址名称" rules={[{ required: true, message: '请输入地址名称' }]}>
                  <Input placeholder="请输入代码扫描服务配置地址名称" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="address" label="服务地址" rules={[{ required: true, message: '请输入服务地址' }]}>
                  <Input placeholder="请输入代码扫描服务配置地址" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="cliServer" label="CLI服务器" rules={[{ required: true, message: '请输入CLI服务器地址' }]}>
                  <Input placeholder="请输入代码扫描cli服务器" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="adminToken" label="管理员令牌" rules={[{ required: true, message: '请输入管理员令牌' }]}>
                  <Input.Password placeholder="请输入代码扫描管理员令牌" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="scanUser" label="扫描用户" rules={[{ required: true, message: '请输入扫描用户' }]}>
                  <Input placeholder="请输入代码扫描用户" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="scanUserPassword" label="用户密码" rules={[{ required: true, message: '请输入用户密码' }]}>
                  <Input.Password placeholder="请输入代码扫描用户密码" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item
                  name="scanUserEmail"
                  label="用户邮箱"
                  rules={[{ required: true, message: '请输入用户邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}
                >
                  <Input placeholder="请输入代码扫描用户邮箱" allowClear disabled={!editing} />
                </Form.Item>
                <Form.Item name="projectId" label="所属项目" rules={[{ required: true, message: '请选择所属项目' }]}>
                  <Select placeholder="请选择所属项目" options={projectOptions} disabled={!editing} />
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

