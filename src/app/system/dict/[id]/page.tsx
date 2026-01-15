'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import dayjs from 'dayjs';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import dictStore, { DictDataItem, DictStyle } from '@/stores/dictStore';

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

const styleTag = (style: DictStyle) => {
  if (style === 'primary') return <Tag color="blue">主要(primary)</Tag>;
  if (style === 'success') return <Tag color="green">成功(success)</Tag>;
  if (style === 'warning') return <Tag color="orange">警告(warning)</Tag>;
  if (style === 'danger') return <Tag color="red">危险(danger)</Tag>;
  return <Tag>默认(default)</Tag>;
};

type SearchValues = {
  label?: string;
};

type FormValues = {
  label: string;
  value: string;
  cssClass?: string;
  sort: number;
  listClass: DictStyle;
  remark?: string;
};

export default function DictDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = String(params.id);

  const snapshot = useSyncExternalStore(dictStore.subscribe, dictStore.getSnapshot, dictStore.getSnapshot);
  const dictTypeRecord = useMemo(() => snapshot.dictTypes.find((t) => t.id === id), [snapshot.dictTypes, id]);

  const [searchForm] = Form.useForm<SearchValues>();
  const [form] = Form.useForm<FormValues>();

  const [loading, setLoading] = useState(false);
  const [searchValues, setSearchValues] = useState<SearchValues>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加字典数据');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    const dictType = dictTypeRecord?.type;
    if (!dictType) return [];
    const label = searchValues.label?.trim().toLowerCase();

    return snapshot.dictData
      .filter((item) => item.dictType === dictType)
      .filter((item) => {
        if (label && !item.label.toLowerCase().includes(label)) return false;
        return true;
      })
      .slice()
      .sort((a, b) => a.sort - b.sort);
  }, [dictTypeRecord?.type, searchValues.label, snapshot.dictData]);

  const openAdd = () => {
    if (!dictTypeRecord) return;
    setModalTitle('添加字典数据');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ sort: 0, listClass: 'primary' } as FormValues);
    setModalOpen(true);
  };

  const openEdit = (record: DictDataItem) => {
    setModalTitle('修改字典数据');
    setEditingId(record.id);
    form.setFieldsValue({
      label: record.label,
      value: record.value,
      cssClass: record.cssClass,
      sort: record.sort,
      listClass: record.listClass,
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
    const record = snapshot.dictData.find((d) => d.id === String(selectedRowKeys[0]));
    if (!record) return;
    openEdit(record);
  };

  const submit = async () => {
    if (!dictTypeRecord) return;
    const values = await form.validateFields();
    setLoading(true);
    setTimeout(() => {
      if (editingId) {
        const updated = dictStore.updateData(editingId, values);
        setLoading(false);
        if (!updated) {
          message.error('记录不存在或已被删除');
          return;
        }
        message.success('修改成功');
      } else {
        dictStore.createData({ ...values, dictType: dictTypeRecord.type });
        setLoading(false);
        message.success('新增成功');
      }
      setModalOpen(false);
      setSelectedRowKeys([]);
    }, 300);
  };

  const deleteByIds = (ids: React.Key[]) => {
    if (!ids.length) return;
    setLoading(true);
    setTimeout(() => {
      dictStore.removeData(ids.map(String));
      setSelectedRowKeys([]);
      setLoading(false);
      message.success('删除成功');
    }, 300);
  };

  const exportData = () => {
    if (!dictTypeRecord) return;
    downloadCsv(
      `字典数据_${dictTypeRecord.type}_${dayjs().format('YYYYMMDD_HHmmss')}.csv`,
      ['字典标签', '字典键值', '字典排序', '回显样式', '备注', '创建时间', '最后更新时间', '最后更新人'],
      filteredData.map((d) => [d.label, d.value, d.sort, d.listClass, d.remark ?? '', d.createTime, d.updatedTime, d.updatedBy])
    );
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchValues(values);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchValues({});
    setSelectedRowKeys([]);
  };

  const columns: ColumnsType<DictDataItem> = [
    { title: '字典标签', dataIndex: 'label', key: 'label', ellipsis: true },
    { title: '字典键值', dataIndex: 'value', key: 'value', ellipsis: true },
    { title: '字典排序', dataIndex: 'sort', key: 'sort', width: 110 },
    {
      title: '回显样式',
      dataIndex: 'listClass',
      key: 'listClass',
      width: 150,
      render: (v: DictStyle) => styleTag(v),
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
    { title: '最后更新时间', dataIndex: 'updatedTime', key: 'updatedTime', width: 170 },
    { title: '最后更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record) => (
        <Space size={8}>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            修改
          </Button>
          <Popconfirm title="确认删除该字典数据？" onConfirm={() => deleteByIds([record.id])}>
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
        <Card
          bordered={false}
          title="字典数据详情"
          extra={
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/system/dict')}>
                返回
              </Button>
            </Space>
          }
          bodyStyle={{ padding: '16px 24px 24px' }}
          style={{ marginBottom: 12 }}
        >
          {!dictTypeRecord ? (
            <div style={{ padding: 24 }}>未找到该字典类型</div>
          ) : (
            <Space size={12} wrap>
              <Tag color="blue">{dictTypeRecord.name}</Tag>
              <Tag>{dictTypeRecord.type}</Tag>
              <Tag color={dictTypeRecord.status === 'active' ? 'green' : 'default'}>
                {dictTypeRecord.status === 'active' ? '正常' : '停用'}
              </Tag>
              <span style={{ color: '#999' }}>最后更新：{dictTypeRecord.updatedTime}</span>
              <span style={{ color: '#999' }}>更新人：{dictTypeRecord.updatedBy}</span>
            </Space>
          )}
        </Card>

        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="label" label="字典标签">
              <Input placeholder="请输入字典标签" allowClear style={{ width: 240 }} disabled={!dictTypeRecord} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} disabled={!dictTypeRecord}>
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset} disabled={!dictTypeRecord}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card bordered={false} bodyStyle={{ padding: '16px 24px 24px' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} disabled={!dictTypeRecord}>
                新增
              </Button>
              <Button icon={<EditOutlined />} onClick={openEditBySelection} disabled={!selectedRowKeys.length || !dictTypeRecord}>
                修改
              </Button>
              <Popconfirm
                title="确认删除选中的字典数据？"
                onConfirm={() => deleteByIds(selectedRowKeys)}
                disabled={!selectedRowKeys.length || !dictTypeRecord}
              >
                <Button danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length || !dictTypeRecord}>
                  删除
                </Button>
              </Popconfirm>
              <Button icon={<DownloadOutlined />} onClick={exportData} disabled={!dictTypeRecord}>
                导出
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredData}
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
          <Form form={form} layout="vertical">
            <Form.Item name="label" label="字典标签" rules={[{ required: true, message: '请输入字典标签' }]}>
              <Input placeholder="请输入字典标签" allowClear />
            </Form.Item>
            <Form.Item name="value" label="字典键值" rules={[{ required: true, message: '请输入字典键值' }]}>
              <Input placeholder="请输入字典键值" allowClear />
            </Form.Item>
            <Form.Item name="sort" label="字典排序" rules={[{ required: true, message: '请输入排序' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="listClass" label="回显样式" rules={[{ required: true, message: '请选择回显样式' }]}>
              <Select
                options={[
                  { label: '默认(default)', value: 'default' },
                  { label: '主要(primary)', value: 'primary' },
                  { label: '成功(success)', value: 'success' },
                  { label: '警告(warning)', value: 'warning' },
                  { label: '危险(danger)', value: 'danger' },
                ]}
              />
            </Form.Item>
            <Form.Item name="cssClass" label="CSS Class">
              <Input placeholder="可选：自定义 CSS class" allowClear />
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

