'use client';

import React, { useMemo, useState } from 'react';
import { Button, Card, Form, Input, Radio, Select, Space, Switch, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import apiTestEnvironmentStore from '@/stores/apiTestEnvironmentStore';
import { useTenantStore } from '@/stores/tenantStore';

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

    
const protocolOptions = ['HTTP', 'HTTPS', 'WS', 'WSS', 'TCP'].map((value) => ({ value, label: value }));

export default function SystemEnvironmentAddPage() {
  const router = useRouter();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const { currentTenant } = useTenantStore();

  React.useEffect(() => {
    if (currentTenant) {
      form.setFieldsValue({ projectId: currentTenant.id });
    }
  }, [currentTenant, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!currentTenant) {
      message.error('未选择所属项目（租户）');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      apiTestEnvironmentStore.create({
        ...values,
        projectId: currentTenant.id,
        projectName: currentTenant.companyName,
      });
      setLoading(false);
      message.success('新增成功');
      router.push('/system/environment');
    }, 300);
  };

  return (
    <MainLayout title="环境管理">
      <div className="p-4">
        <Card
          bordered={false}
          title="新增环境"
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/system/environment')}>
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
            initialValues={{
              status: 'active',
              isProxy: false,
              protocols: ['HTTP'],
              projectId: currentTenant?.id, // 设置默认值
            }}
          >
            <Form.Item name="projectId" label="所属项目" rules={[{ required: true, message: '请选择所属项目' }]}>
              <Select
                placeholder="请选择所属项目"
                options={currentTenant ? [{ value: currentTenant.id, label: currentTenant.companyName }] : []}
                disabled
              />
            </Form.Item>
            <Form.Item name="systemId" label="系统ID" rules={[{ required: true, message: '请输入系统ID' }]}>
              <Input placeholder="请输入系统ID" allowClear />
            </Form.Item>
            <Form.Item name="systemName" label="系统名称" rules={[{ required: true, message: '请输入系统名称' }]}>
              <Input placeholder="请输入系统名称" allowClear />
            </Form.Item>
            <Form.Item name="ipAddress" label="IP地址" rules={[{ required: true, message: '请输入IP地址' }]}>
              <Input placeholder="请输入IP地址" allowClear />
            </Form.Item>
            <Form.Item name="businessPort" label="业务端口" rules={[{ required: true, message: '请输入业务端口' }]}>
              <Input placeholder="请输入业务端口" allowClear />
            </Form.Item>
            <Form.Item name="defaultPath" label="默认路径" rules={[{ required: true, message: '请输入默认路径' }]}>
              <Input placeholder="请输入默认路径" allowClear />
            </Form.Item>
            <Form.Item name="isProxy" label="是否代理" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="protocols" label="支持协议" rules={[{ required: true, message: '请选择支持协议' }]}>
              <Select mode="multiple" placeholder="请选择支持协议" options={protocolOptions} />
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
                <Button onClick={() => router.push('/system/environment')}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}

