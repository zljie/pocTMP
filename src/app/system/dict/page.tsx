'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Button, Card, DatePicker, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import dictStore, { DictStatus, DictTypeItem } from '@/stores/dictStore';

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

const statusTag = (status: DictStatus) => (
  <Tag color={status === 'active' ? 'green' : 'default'}>{status === 'active' ? '正常' : '停用'}</Tag>
);

type DictTypeSearchValues = {
  name?: string;
  type?: string;
  status?: DictStatus;
  createTimeRange?: [Dayjs, Dayjs];
};

type DictTypeFormValues = {
  name: string;
  type: string;
  status: DictStatus;
  remark?: string;
};

export default function DictPage() {
  const router = useRouter();
  const [typeForm] = Form.useForm<DictTypeFormValues>();
  const [typeSearchForm] = Form.useForm<DictTypeSearchValues>();

  const snapshot = useSyncExternalStore(dictStore.subscribe, dictStore.getSnapshot, dictStore.getSnapshot);
  const dictTypes = snapshot.dictTypes;

  const [loading, setLoading] = useState(false);
  const [searchValues, setSearchValues] = useState<DictTypeSearchValues>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加字典类型');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredTypes = useMemo(() => {
    const name = searchValues.name?.trim().toLowerCase();
    const type = searchValues.type?.trim().toLowerCase();
    const status = searchValues.status;
    const range = searchValues.createTimeRange;

    return dictTypes.filter((item) => {
      if (name && !item.name.toLowerCase().includes(name)) return false;
      if (type && !item.type.toLowerCase().includes(type)) return false;
      if (status && item.status !== status) return false;
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
  }, [dictTypes, searchValues]);

  const selectedRecord = useMemo(() => {
    if (selectedRowKeys.length !== 1) return undefined;
    return dictTypes.find((t) => t.id === String(selectedRowKeys[0]));
  }, [dictTypes, selectedRowKeys]);

  const openAdd = () => {
    setModalTitle('添加字典类型');
    setEditingId(null);
    typeForm.resetFields();
    typeForm.setFieldsValue({ status: 'active' } as DictTypeFormValues);
    setModalOpen(true);
  };

  const openEdit = (record: DictTypeItem) => {
    setModalTitle('修改字典类型');
    setEditingId(record.id);
    typeForm.setFieldsValue({
      name: record.name,
      type: record.type,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const openEditBySelection = () => {
    if (!selectedRowKeys.length) {
      message.warning('请选择需要修改的数据');
      return;
    }
    if (selectedRowKeys.length > 1) {
      message.warning('一次只能修改一条数据');
      return;
    }
    const record = dictTypes.find((t) => t.id === String(selectedRowKeys[0]));
    if (!record) return;
    openEdit(record);
  };

  const handleOpenDetail = (record: DictTypeItem) => {
    router.push(`/system/dict/${record.id}`);
  };

  const openDetailBySelection = () => {
    if (!selectedRecord) {
      message.warning('请选择一条字典类型');
      return;
    }
    handleOpenDetail(selectedRecord);
  };

  const submit = async () => {
    const values = await typeForm.validateFields();
    setLoading(true);
    setTimeout(() => {
      if (editingId) {
        const updated = dictStore.updateType(editingId, values);
        setLoading(false);
        if (!updated) {
          message.error('记录不存在或已被删除');
          return;
        }
        message.success('修改成功');
      } else {
        dictStore.createType(values);
        setLoading(false);
        message.success('新增成功');
      }
      setModalOpen(false);
      setSelectedRowKeys([]);
    }, 300);
  };

  const deleteTypesByIds = (ids: React.Key[]) => {
    if (!ids.length) return;
    setLoading(true);
    setTimeout(() => {
      dictStore.removeTypes(ids.map(String));
      setSelectedRowKeys([]);
      setLoading(false);
      message.success('删除成功');
    }, 300);
  };

  const exportTypes = () => {
    downloadCsv(
      `字典类型_${dayjs().format('YYYYMMDD_HHmmss')}.csv`,
      ['字典名称', '字典类型', '状态', '备注', '创建时间', '最后更新时间', '最后更新人'],
      filteredTypes.map((t) => [
        t.name,
        t.type,
        t.status === 'active' ? '正常' : '停用',
        t.remark ?? '',
        t.createTime,
        t.updatedTime,
        t.updatedBy,
      ])
    );
  };

  const handleSearch = () => {
    const values = typeSearchForm.getFieldsValue();
    setSearchValues(values);
  };

  const handleReset = () => {
    typeSearchForm.resetFields();
    setSearchValues({});
    setSelectedRowKeys([]);
  };

  const refreshTypeCache = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('刷新缓存成功');
    }, 300);
  };

  const columns: ColumnsType<DictTypeItem> = [
    { title: '字典名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '字典类型', dataIndex: 'type', key: 'type', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 110, render: (v: DictStatus) => statusTag(v) },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
    { title: '最后更新时间', dataIndex: 'updatedTime', key: 'updatedTime', width: 170 },
    { title: '最后更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: unknown, record) => (
        <Space size={8}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleOpenDetail(record)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            修改
          </Button>
          <Popconfirm title="确认删除该字典类型？" onConfirm={() => deleteTypesByIds([record.id])}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="字典管理">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={typeSearchForm} layout="inline">
            <Form.Item name="name" label="字典名称">
              <Input placeholder="请输入字典名称" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="type" label="字典类型">
              <Input placeholder="请输入字典类型" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                allowClear
                placeholder="请选择状态"
                style={{ width: 160 }}
                options={[
                  { label: '正常', value: 'active' },
                  { label: '停用', value: 'inactive' },
                ]}
              />
            </Form.Item>
            <Form.Item name="createTimeRange" label="创建时间">
              <DatePicker.RangePicker />
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
              <Button icon={<EditOutlined />} onClick={openEditBySelection}>
                修改
              </Button>
              <Button icon={<EyeOutlined />} onClick={openDetailBySelection} disabled={!selectedRecord}>
                详情
              </Button>
              <Popconfirm
                title="确认删除选中的字典类型？"
                onConfirm={() => deleteTypesByIds(selectedRowKeys)}
                disabled={!selectedRowKeys.length}
              >
                <Button danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>
                  删除
                </Button>
              </Popconfirm>
              <Button icon={<DownloadOutlined />} onClick={exportTypes}>
                导出
              </Button>
              <Button icon={<SyncOutlined />} onClick={refreshTypeCache}>
                刷新缓存
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredTypes}
            rowKey="id"
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            size="middle"
          />
        </Card>

        <Modal title={modalTitle} open={modalOpen} onOk={submit} onCancel={() => setModalOpen(false)} width={600} confirmLoading={loading}>
          <Form form={typeForm} layout="vertical">
            <Form.Item name="name" label="字典名称" rules={[{ required: true, message: '请输入字典名称' }]}>
              <Input placeholder="请输入字典名称" allowClear />
            </Form.Item>
            <Form.Item name="type" label="字典类型" rules={[{ required: true, message: '请输入字典类型' }]}>
              <Input placeholder="请输入字典类型" allowClear />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select
                options={[
                  { label: '正常', value: 'active' },
                  { label: '停用', value: 'inactive' },
                ]}
              />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={3} placeholder="请输入备注" allowClear />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}

