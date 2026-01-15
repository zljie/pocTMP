'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { Button, Card, Form, Input, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import apiTestEnvironmentStore, { ApiTestEnvironment } from '@/stores/apiTestEnvironmentStore';

type SearchValues = {
  projectId?: string;
  systemName?: string;
  ipAddress?: string;
};

const projects = [
  { id: 'p1', name: '示例项目A' },
  { id: 'p2', name: '示例项目B' },
  { id: 'p3', name: '示例项目C' },
];

export default function SystemEnvironmentPage() {
  const router = useRouter();
  const [searchForm] = Form.useForm<SearchValues>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const allData = useSyncExternalStore(
    apiTestEnvironmentStore.subscribe,
    apiTestEnvironmentStore.getSnapshot,
    apiTestEnvironmentStore.getSnapshot
  );
  const [searchValues, setSearchValues] = useState<SearchValues>({});

  const filteredData = useMemo(() => {
    const projectId = searchValues.projectId;
    const systemName = searchValues.systemName?.trim();
    const ipAddress = searchValues.ipAddress?.trim();

    return allData.filter((item) => {
      if (projectId && item.projectId !== projectId) return false;
      if (systemName && !item.systemName.toLowerCase().includes(systemName.toLowerCase())) return false;
      if (ipAddress && !item.ipAddress.toLowerCase().includes(ipAddress.toLowerCase())) return false;
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
      apiTestEnvironmentStore.removeMany(selectedRowKeys.map(String));
      setSelectedRowKeys([]);
      setLoading(false);
      message.success('删除成功');
    }, 300);
  };

  const handleDeleteOne = async (id: string) => {
    setLoading(true);
    setTimeout(() => {
      apiTestEnvironmentStore.removeOne(id);
      setSelectedRowKeys((prev) => prev.filter((key) => String(key) !== id));
      setLoading(false);
      message.success('删除成功');
    }, 300);
  };

  const columns: ColumnsType<ApiTestEnvironment> = [
    { title: '所属项目', dataIndex: 'projectName', width: 160, fixed: 'left' },
    { title: '系统ID', dataIndex: 'systemId', width: 120 },
    { title: '系统名称', dataIndex: 'systemName', width: 180 },
    { title: 'IP地址', dataIndex: 'ipAddress', width: 140 },
    { title: '业务端口', dataIndex: 'businessPort', width: 110 },
    { title: '默认路径', dataIndex: 'defaultPath', width: 180 },
    {
      title: '是否代理',
      dataIndex: 'isProxy',
      width: 110,
      render: (value) => (value ? <Tag color="blue">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: '支持协议',
      dataIndex: 'protocols',
      width: 160,
      render: (value) => (Array.isArray(value) && value.length ? value.join('、') : '-'),
    },
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
          <Button type="link" icon={<EyeOutlined />} onClick={() => router.push(`/system/environment/${record.id}`)}>
            详情
          </Button>
          <Popconfirm title="确定删除该环境吗？" onConfirm={() => handleDeleteOne(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="环境管理">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="projectId">
              <Select
                placeholder="所属项目"
                allowClear
                style={{ width: 200 }}
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Form.Item>
            <Form.Item name="systemName">
              <Input placeholder="系统名称" allowClear style={{ width: 220 }} />
            </Form.Item>
            <Form.Item name="ipAddress">
              <Input placeholder="IP地址" allowClear style={{ width: 220 }} />
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
              <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/system/environment/add')}>
                新增
              </Button>
              <Popconfirm title="确定删除选中环境吗？" onConfirm={handleBatchDelete} disabled={!canDelete}>
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
            scroll={{ x: 1700 }}
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

