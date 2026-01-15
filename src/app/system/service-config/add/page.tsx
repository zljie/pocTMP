'use client';

import React, { useMemo, useState } from 'react';
import { Button, Card, Form, Input, Radio, Select, Space, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import serviceConfigStore from '@/stores/serviceConfigStore';

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

export default function ServiceConfigAddPage() {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const projectOptions = useMemo(() => projects.map((p) => ({ value: p.id, label: p.name })), []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const project = projects.find((p) => p.id === values.projectId);
    if (!project) {
      message.error('所属项目无效');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      serviceConfigStore.create({
        ...values,
        projectName: project.name,
      });
      setLoading(false);
      message.success('新增成功');
      router.push('/system/service-config');
    }, 300);
  };

  return (
    <MainLayout title="服务配置管理">
      <div className="p-4">
        <Card
          bordered={false}
          title="新增服务配置"
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/system/service-config')}>
              返回
            </Button>
          }
          bodyStyle={{ padding: '16px 24px 24px' }}
        >
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            initialValues={{ status: 'active' }}
          >
            <Form.Item name="addressName" label="地址名称" rules={[{ required: true, message: '请输入地址名称' }]}>
              <Input placeholder="请输入代码扫描服务配置地址名称" allowClear />
            </Form.Item>
            <Form.Item name="address" label="服务地址" rules={[{ required: true, message: '请输入服务地址' }]}>
              <Input placeholder="请输入代码扫描服务配置地址" allowClear />
            </Form.Item>
            <Form.Item name="cliServer" label="CLI服务器" rules={[{ required: true, message: '请输入CLI服务器地址' }]}>
              <Input placeholder="请输入代码扫描cli服务器" allowClear />
            </Form.Item>
            <Form.Item name="adminToken" label="管理员令牌" rules={[{ required: true, message: '请输入管理员令牌' }]}>
              <Input.Password placeholder="请输入代码扫描管理员令牌" allowClear />
            </Form.Item>
            <Form.Item name="scanUser" label="扫描用户" rules={[{ required: true, message: '请输入扫描用户' }]}>
              <Input placeholder="请输入代码扫描用户" allowClear />
            </Form.Item>
            <Form.Item name="scanUserPassword" label="用户密码" rules={[{ required: true, message: '请输入用户密码' }]}>
              <Input.Password placeholder="请输入代码扫描用户密码" allowClear />
            </Form.Item>
            <Form.Item name="scanUserEmail" label="用户邮箱" rules={[{ required: true, message: '请输入用户邮箱' }, { type: 'email', message: '邮箱格式不正确' }]}>
              <Input placeholder="请输入代码扫描用户邮箱" allowClear />
            </Form.Item>
            <Form.Item name="projectId" label="所属项目" rules={[{ required: true, message: '请选择所属项目' }]}>
              <Select placeholder="请选择所属项目" options={projectOptions} />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Radio.Group>
                <Radio value="active">正常</Radio>
                <Radio value="inactive">停用</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
              <Space>
                <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSubmit}>
                  保存
                </Button>
                <Button onClick={() => router.push('/system/service-config')}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}

