'use client';

import React, { useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Button, Card, DatePicker, Form, Input, Modal, Popconfirm, Radio, Select, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';

interface ConfigType {
  id: string;
  name: string;
  key: string;
  value: string;
  isSystem: boolean;
  remark?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

const initialData: ConfigType[] = [
  {
    id: '1',
    name: '主框架页_默认皮肤样式名称',
    key: 'sys.index.skinName',
    value: 'skin-blue',
    isSystem: true,
    remark: '蓝色 skin-blue、绿色 skin-green、紫色 skin-purple、红色 skin-red、黄色 skin-yellow',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '2',
    name: '用户管理_账号初始密码',
    key: 'sys.user.initPassword',
    value: '123456',
    isSystem: true,
    remark: '初始化密码 123456',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '3',
    name: '主框架页_侧边栏主题',
    key: 'sys.index.sideTheme',
    value: 'theme-dark',
    isSystem: true,
    remark: '深色主题theme-dark、浅色主题theme-light',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '4',
    name: '账号自助_是否开启用户注册功能',
    key: 'sys.account.registerUser',
    value: 'false',
    isSystem: true,
    remark: '是否开启注册用户功能（true开启，false关闭）',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '5',
    name: 'OSS预览列表资源开关',
    key: 'sys.oss.previewListResource',
    value: 'true',
    isSystem: true,
    remark: 'true:开启, false:关闭',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

type SearchValues = {
  name?: string;
  key?: string;
  isSystem?: boolean;
  createTimeRange?: [Dayjs, Dayjs];
};

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const getNextId = (items: ConfigType[]) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

const escapeCsv = (value: unknown) => {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const downloadCsv = (filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) => {
  const content = [headers.join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function ConfigPage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<ConfigType[]>(initialData);
  const [searchValues, setSearchValues] = useState<SearchValues>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加参数');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    const name = searchValues.name?.trim();
    const key = searchValues.key?.trim();
    const range = searchValues.createTimeRange;
    const isSystem = searchValues.isSystem;

    return allData.filter((item) => {
      if (name && !item.name.toLowerCase().includes(name.toLowerCase())) return false;
      if (key && !item.key.toLowerCase().includes(key.toLowerCase())) return false;
      if (typeof isSystem === 'boolean' && item.isSystem !== isSystem) return false;
      if (range?.length === 2) {
        const created = dayjs(item.createTime);
        if (!created.isValid()) return false;
        const [start, end] = range;
        const createdMs = created.valueOf();
        const startMs = start.startOf('day').valueOf();
        const endMs = end.endOf('day').valueOf();
        if (createdMs < startMs || createdMs > endMs) return false;
      }
      return true;
    });
  }, [allData, searchValues]);

  const openAdd = () => {
    setModalTitle('添加参数');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ isSystem: true });
    setIsModalOpen(true);
  };

  const openEdit = (record: ConfigType) => {
    setModalTitle('修改参数');
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchValues(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchValues({});
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setTimeout(() => {
      const updatedTime = nowText();
      const updatedBy = '管理员';

      if (editingId) {
        setAllData((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...values,
                  updatedTime,
                  updatedBy,
                }
              : item
          )
        );
        message.success('修改成功');
      } else {
        const id = getNextId(allData);
        const record: ConfigType = {
          id,
          name: values.name,
          key: values.key,
          value: values.value,
          isSystem: values.isSystem ?? false,
          remark: values.remark,
          createTime: updatedTime,
          updatedTime,
          updatedBy,
        };
        setAllData((prev) => [record, ...prev]);
        message.success('新增成功');
      }

      setLoading(false);
      setIsModalOpen(false);
      setSelectedRowKeys([]);
    }, 300);
  };

  const handleDeleteByIds = (ids: React.Key[]) => {
    if (!ids.length) return;
    setAllData((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelectedRowKeys([]);
    message.success('删除成功');
  };

  const handleExport = () => {
    const rows = filteredData.map((item) => [
      item.name,
      item.key,
      item.value,
      item.isSystem ? '是' : '否',
      item.remark ?? '',
      item.createTime,
      item.updatedTime,
      item.updatedBy,
    ]);
    downloadCsv(
      `参数设置_${dayjs().format('YYYYMMDD_HHmmss')}.csv`,
      ['参数名称', '参数键名', '参数键值', '系统内置', '备注', '创建时间', '最后更新时间', '最后更新人'],
      rows
    );
  };

  const handleRefreshCache = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('刷新缓存成功（模拟）');
    }, 500);
  };

  const selectedRecords = useMemo(() => {
    const selected = new Set(selectedRowKeys.map(String));
    return allData.filter((item) => selected.has(item.id));
  }, [allData, selectedRowKeys]);

  const canEdit = selectedRecords.length === 1;
  const canDelete = selectedRowKeys.length > 0;

  const columns: ColumnsType<ConfigType> = [
    { title: '参数名称', dataIndex: 'name', key: 'name', width: 260 },
    { title: '参数键名', dataIndex: 'key', key: 'key', width: 220 },
    { title: '参数键值', dataIndex: 'value', key: 'value', width: 160 },
    {
      title: '系统内置',
      dataIndex: 'isSystem',
      key: 'isSystem',
      width: 120,
      align: 'center',
      render: (value: boolean) => <Tag color={value ? 'blue' : 'default'}>{value ? '是' : '否'}</Tag>,
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: 320, ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
    { title: '最后更新时间', dataIndex: 'updatedTime', key: 'updatedTime', width: 180 },
    { title: '最后更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确定删除该参数吗？" onConfirm={() => handleDeleteByIds([record.id])}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="参数设置">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="name" label="参数名称">
              <Input placeholder="请输入参数名称" allowClear style={{ width: 220 }} />
            </Form.Item>
            <Form.Item name="key" label="参数键名">
              <Input placeholder="请输入参数键名" allowClear style={{ width: 220 }} />
            </Form.Item>
            <Form.Item name="isSystem" label="系统内置">
              <Select placeholder="系统内置" allowClear style={{ width: 140 }} options={[{ label: '是', value: true }, { label: '否', value: false }]} />
            </Form.Item>
            <Form.Item name="createTimeRange" label="创建时间">
              <DatePicker.RangePicker style={{ width: 260 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card bordered={false} bodyStyle={{ padding: '16px 24px 24px' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
                新增
              </Button>
              <Button icon={<EditOutlined />} disabled={!canEdit} onClick={() => selectedRecords[0] && openEdit(selectedRecords[0])}>
                修改
              </Button>
              <Popconfirm title="确定删除选中参数吗？" onConfirm={() => handleDeleteByIds(selectedRowKeys)} disabled={!canDelete}>
                <Button danger icon={<DeleteOutlined />} disabled={!canDelete}>
                  删除
                </Button>
              </Popconfirm>
              <Button icon={<DownloadOutlined />} onClick={handleExport} disabled={filteredData.length === 0}>
                导出
              </Button>
              <Button icon={<SyncOutlined />} onClick={handleRefreshCache}>
                刷新缓存
              </Button>
            </Space>
            <Space>
              <Button type="text" icon={<SearchOutlined />} onClick={handleSearch} />
              <Button type="text" icon={<ReloadOutlined />} onClick={handleRefreshCache} />
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
            scroll={{ x: 1200 }}
            pagination={{
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>

        <Modal title={modalTitle} open={isModalOpen} onOk={handleSubmit} onCancel={() => setIsModalOpen(false)} width={600} confirmLoading={loading}>
          <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item name="name" label="参数名称" rules={[{ required: true, message: '请输入参数名称' }]}>
              <Input placeholder="请输入参数名称" />
            </Form.Item>
            <Form.Item name="key" label="参数键名" rules={[{ required: true, message: '请输入参数键名' }]}>
              <Input placeholder="请输入参数键名" />
            </Form.Item>
            <Form.Item name="value" label="参数键值" rules={[{ required: true, message: '请输入参数键值' }]}>
              <Input.TextArea placeholder="请输入参数键值" autoSize={{ minRows: 3, maxRows: 6 }} />
            </Form.Item>
            <Form.Item name="isSystem" label="系统内置" initialValue={true} rules={[{ required: true, message: '请选择系统内置' }]}>
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="请输入内容" autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}
