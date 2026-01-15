'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { Button, Card, Form, Input, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import serviceConfigStore, { ServiceConfig } from '@/stores/serviceConfigStore';

type SearchValues = {
  address?: string;
  projectId?: string;
};

const projects = [
  { id: 'p1', name: '示例项目A' },
  { id: 'p2', name: '示例项目B' },
  { id: 'p3', name: '示例项目C' },
];

const maskText = (value: string, min = 6) => {
  if (!value) return '-';
  if (value.length <= min) return '******';
  return `${value.slice(0, 3)}******${value.slice(-3)}`;
};

export default function ServiceConfigPage() {
  const router = useRouter();
  const [searchForm] = Form.useForm<SearchValues>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const allData = useSyncExternalStore(serviceConfigStore.subscribe, serviceConfigStore.getSnapshot, serviceConfigStore.getSnapshot);
  const [searchValues, setSearchValues] = useState<SearchValues>({});

  const filteredData = useMemo(() => {
    const address = searchValues.address?.trim();
    const projectId = searchValues.projectId;

    return allData.filter((item) => {
      if (address && !item.address.toLowerCase().includes(address.toLowerCase())) return false;
      if (projectId && item.projectId !== projectId) return false;
      return true;
    });
  }, [allData, searchValues]);

  const canDelete = selectedRowKeys.length > 0;

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchValues(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchValues({});
    setSelectedRowKeys([]);
  };

  const handleBatchDelete = async () => {
    setLoading(true);
    setTimeout(() => {
      serviceConfigStore.removeMany(selectedRowKeys.map(String));
      setSelectedRowKeys([]);
      setLoading(false);
      message.success('删除成功');
    }, 300);
  };

  const handleDeleteOne = async (id: string) => {
    setLoading(true);
    setTimeout(() => {
      serviceConfigStore.removeOne(id);
      setSelectedRowKeys((prev) => prev.filter((key) => String(key) !== id));
      setLoading(false);
      message.success('删除成功');
    }, 300);
  };

  const columns: ColumnsType<ServiceConfig> = [
    { title: 'ID', dataIndex: 'id', width: 80, fixed: 'left' },
    { title: '代码扫描服务配置地址名称', dataIndex: 'addressName', width: 200 },
    { title: '代码扫描服务配置地址', dataIndex: 'address', width: 220 },
    { title: '代码扫描cli服务器', dataIndex: 'cliServer', width: 200 },
    {
      title: '代码扫描管理员令牌',
      dataIndex: 'adminToken',
      width: 180,
      render: (value) => <span>{maskText(String(value ?? ''))}</span>,
    },
    { title: '代码扫描用户', dataIndex: 'scanUser', width: 160 },
    {
      title: '代码扫描用户密码',
      dataIndex: 'scanUserPassword',
      width: 160,
      render: (value) => <span>{maskText(String(value ?? ''))}</span>,
    },
    { title: '代码扫描用户邮箱', dataIndex: 'scanUserEmail', width: 220 },
    { title: '所属项目', dataIndex: 'projectName', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value) => (value === 'active' ? <Tag color="green">正常</Tag> : <Tag color="red">停用</Tag>),
    },
    { title: '最后更新时间', dataIndex: 'updatedTime', width: 180 },
    { title: '最后更新人', dataIndex: 'updatedBy', width: 120 },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => router.push(`/system/service-config/${record.id}`)}>
            详情
          </Button>
          <Popconfirm title="确定删除该配置吗？" onConfirm={() => handleDeleteOne(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="服务配置管理">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="address">
              <Input placeholder="代码扫描服务配置地址" allowClear style={{ width: 280 }} />
            </Form.Item>
            <Form.Item name="projectId">
              <Select placeholder="所属项目" allowClear style={{ width: 200 }} options={projects.map((p) => ({ value: p.id, label: p.name }))} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  清空
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card bordered={false} bodyStyle={{ padding: '16px 24px 24px' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/system/service-config/add')}>
                新增
              </Button>
              <Popconfirm title="确定删除选中配置吗？" onConfirm={handleBatchDelete} disabled={!canDelete}>
                <Button danger icon={<DeleteOutlined />} disabled={!canDelete}>
                  批量删除
                </Button>
              </Popconfirm>
            </Space>
            <Space>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 300);
                }}
              />
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: (nextSelectedRowKeys) => setSelectedRowKeys(nextSelectedRowKeys),
            }}
            size="middle"
            scroll={{ x: 1900 }}
            pagination={{
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>
      </div>
    </MainLayout>
  );
}

