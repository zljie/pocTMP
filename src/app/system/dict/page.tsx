'use client';

import React, { useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';

type Status = 'active' | 'inactive';
type DictStyle = 'default' | 'primary' | 'success' | 'warning' | 'danger';

type DictTypeItem = {
  id: string;
  name: string;
  type: string;
  status: Status;
  remark?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
};

type DictDataItem = {
  id: string;
  dictType: string;
  label: string;
  value: string;
  cssClass?: string;
  sort: number;
  listClass: DictStyle;
  remark?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
};

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const getNextId = (items: { id: string }[]) => {
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

const statusTag = (status: Status) => (
  <Tag color={status === 'active' ? 'green' : 'default'}>{status === 'active' ? '正常' : '停用'}</Tag>
);

const styleTag = (style: DictStyle) => {
  if (style === 'primary') return <Tag color="blue">主要(primary)</Tag>;
  if (style === 'success') return <Tag color="green">成功(success)</Tag>;
  if (style === 'warning') return <Tag color="orange">警告(warning)</Tag>;
  if (style === 'danger') return <Tag color="red">危险(danger)</Tag>;
  return <Tag>默认(default)</Tag>;
};

const initialDictTypes: DictTypeItem[] = [
  {
    id: '1',
    name: '用户性别',
    type: 'sys_user_sex',
    status: 'active',
    remark: '用户性别列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '2',
    name: '菜单状态',
    type: 'sys_show_hide',
    status: 'active',
    remark: '菜单状态列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '3',
    name: '系统开关',
    type: 'sys_yes_no',
    status: 'active',
    remark: '系统开关列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '4',
    name: '系统是否',
    type: 'sys_normal_disable',
    status: 'active',
    remark: '系统是否列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '5',
    name: '通知类型',
    type: 'sys_notice_type',
    status: 'active',
    remark: '通知类型列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '6',
    name: '通知状态',
    type: 'sys_notice_status',
    status: 'active',
    remark: '通知状态列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '7',
    name: '操作类型',
    type: 'sys_oper_type',
    status: 'active',
    remark: '操作类型列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '8',
    name: '系统状态',
    type: 'sys_common_status',
    status: 'active',
    remark: '登录状态列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '9',
    name: '授权类型',
    type: 'sys_auth_type',
    status: 'active',
    remark: '认证授权类型',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '10',
    name: '设备类型',
    type: 'sys_device_type',
    status: 'active',
    remark: '客户端设备类型',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

const initialDictData: DictDataItem[] = [
  {
    id: '1',
    dictType: 'sys_user_sex',
    label: '男',
    value: '0',
    sort: 1,
    listClass: 'primary',
    remark: '性别男',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '2',
    dictType: 'sys_user_sex',
    label: '女',
    value: '1',
    sort: 2,
    listClass: 'primary',
    remark: '性别女',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '3',
    dictType: 'sys_user_sex',
    label: '未知',
    value: '2',
    sort: 3,
    listClass: 'default',
    remark: '性别未知',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

type DictTypeSearchValues = {
  name?: string;
  type?: string;
  status?: Status;
  createTimeRange?: [Dayjs, Dayjs];
};

type DictDataSearchValues = {
  dictType?: string;
  label?: string;
};

export default function DictPage() {
  const [activeTab, setActiveTab] = useState<'types' | 'data'>('types');

  const [typeForm] = Form.useForm();
  const [typeSearchForm] = Form.useForm();
  const [dataForm] = Form.useForm();
  const [dataSearchForm] = Form.useForm();

  const [typeLoading, setTypeLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [dictTypes, setDictTypes] = useState<DictTypeItem[]>(initialDictTypes);
  const [dictData, setDictData] = useState<DictDataItem[]>(initialDictData);

  const [typeSearchValues, setTypeSearchValues] = useState<DictTypeSearchValues>({});
  const [dataSearchValues, setDataSearchValues] = useState<DictDataSearchValues>({});

  const [selectedTypeRowKeys, setSelectedTypeRowKeys] = useState<React.Key[]>([]);
  const [selectedDataRowKeys, setSelectedDataRowKeys] = useState<React.Key[]>([]);

  const [selectedDictType, setSelectedDictType] = useState<string>(() => dictTypes[0]?.type ?? '');

  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [typeModalTitle, setTypeModalTitle] = useState('添加字典类型');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [dataModalTitle, setDataModalTitle] = useState('添加字典数据');
  const [editingDataId, setEditingDataId] = useState<string | null>(null);

  const filteredTypes = useMemo(() => {
    const name = typeSearchValues.name?.trim().toLowerCase();
    const type = typeSearchValues.type?.trim().toLowerCase();
    const status = typeSearchValues.status;
    const range = typeSearchValues.createTimeRange;

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
  }, [dictTypes, typeSearchValues]);

  const filteredData = useMemo(() => {
    const dictType = dataSearchValues.dictType ?? selectedDictType;
    const label = dataSearchValues.label?.trim().toLowerCase();

    return dictData
      .filter((item) => (dictType ? item.dictType === dictType : true))
      .filter((item) => {
        if (label && !item.label.toLowerCase().includes(label)) return false;
        return true;
      })
      .slice()
      .sort((a, b) => a.sort - b.sort);
  }, [dictData, dataSearchValues, selectedDictType]);

  const dictTypeOptions = useMemo(
    () =>
      dictTypes.map((t) => ({
        label: t.name,
        value: t.type,
      })),
    [dictTypes]
  );

  const openAddType = () => {
    setTypeModalTitle('添加字典类型');
    setEditingTypeId(null);
    typeForm.resetFields();
    typeForm.setFieldsValue({ status: 'active' });
    setTypeModalOpen(true);
  };

  const openEditType = (record: DictTypeItem) => {
    setTypeModalTitle('修改字典类型');
    setEditingTypeId(record.id);
    typeForm.setFieldsValue(record);
    setTypeModalOpen(true);
  };

  const openEditTypeBySelection = () => {
    if (!selectedTypeRowKeys.length) {
      message.warning('请选择需要修改的数据');
      return;
    }
    if (selectedTypeRowKeys.length > 1) {
      message.warning('一次只能修改一条数据');
      return;
    }
    const record = dictTypes.find((t) => t.id === selectedTypeRowKeys[0]);
    if (!record) return;
    openEditType(record);
  };

  const submitType = async () => {
    const values = await typeForm.validateFields();
    setTypeLoading(true);

    setTimeout(() => {
      const updatedTime = nowText();
      const updatedBy = '管理员';

      if (editingTypeId) {
        setDictTypes((prev) =>
          prev.map((item) =>
            item.id === editingTypeId
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
        const id = getNextId(dictTypes);
        const record: DictTypeItem = {
          id,
          name: values.name,
          type: values.type,
          status: values.status ?? 'active',
          remark: values.remark,
          createTime: updatedTime,
          updatedTime,
          updatedBy,
        };
        setDictTypes((prev) => [record, ...prev]);
        if (!selectedDictType) {
          setSelectedDictType(record.type);
          dataSearchForm.setFieldsValue({ dictType: record.type });
        }
        message.success('新增成功');
      }

      setTypeLoading(false);
      setTypeModalOpen(false);
      setSelectedTypeRowKeys([]);
    }, 300);
  };

  const deleteTypesByIds = (ids: React.Key[]) => {
    if (!ids.length) return;
    const typesToDelete = new Set(dictTypes.filter((t) => ids.includes(t.id)).map((t) => t.type));
    setDictTypes((prev) => prev.filter((t) => !ids.includes(t.id)));
    setDictData((prev) => prev.filter((d) => !typesToDelete.has(d.dictType)));
    setSelectedTypeRowKeys([]);
    message.success('删除成功');

    if (typesToDelete.has(selectedDictType)) {
      const nextType = dictTypes.find((t) => !ids.includes(t.id))?.type ?? '';
      setSelectedDictType(nextType);
      dataSearchForm.setFieldsValue({ dictType: nextType });
      setDataSearchValues((prev) => ({ ...prev, dictType: nextType || undefined }));
    }
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

  const handleTypeSearch = () => {
    const values = typeSearchForm.getFieldsValue();
    setTypeSearchValues(values);
  };

  const handleTypeReset = () => {
    typeSearchForm.resetFields();
    setTypeSearchValues({});
  };

  const refreshTypeCache = () => {
    setTypeLoading(true);
    setTimeout(() => {
      setTypeLoading(false);
      message.success('刷新缓存成功');
    }, 300);
  };

  const openAddData = () => {
    const dictType = dataSearchForm.getFieldValue('dictType') ?? selectedDictType;
    if (!dictType) {
      message.warning('请先选择字典类型');
      return;
    }
    setDataModalTitle('添加字典数据');
    setEditingDataId(null);
    dataForm.resetFields();
    dataForm.setFieldsValue({ dictType, sort: 0, listClass: 'primary' });
    setDataModalOpen(true);
  };

  const openEditData = (record: DictDataItem) => {
    setDataModalTitle('修改字典数据');
    setEditingDataId(record.id);
    dataForm.setFieldsValue(record);
    setDataModalOpen(true);
  };

  const openEditDataBySelection = () => {
    if (!selectedDataRowKeys.length) {
      message.warning('请选择需要修改的数据');
      return;
    }
    if (selectedDataRowKeys.length > 1) {
      message.warning('一次只能修改一条数据');
      return;
    }
    const record = dictData.find((d) => d.id === selectedDataRowKeys[0]);
    if (!record) return;
    openEditData(record);
  };

  const submitData = async () => {
    const values = await dataForm.validateFields();
    setDataLoading(true);

    setTimeout(() => {
      const updatedTime = nowText();
      const updatedBy = '管理员';

      if (editingDataId) {
        setDictData((prev) =>
          prev.map((item) =>
            item.id === editingDataId
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
        const id = getNextId(dictData);
        const record: DictDataItem = {
          id,
          dictType: values.dictType,
          label: values.label,
          value: values.value,
          cssClass: values.cssClass,
          sort: values.sort ?? 0,
          listClass: values.listClass ?? 'default',
          remark: values.remark,
          createTime: updatedTime,
          updatedTime,
          updatedBy,
        };
        setDictData((prev) => [record, ...prev]);
        message.success('新增成功');
      }

      setDataLoading(false);
      setDataModalOpen(false);
      setSelectedDataRowKeys([]);
    }, 300);
  };

  const deleteDataByIds = (ids: React.Key[]) => {
    if (!ids.length) return;
    setDictData((prev) => prev.filter((d) => !ids.includes(d.id)));
    setSelectedDataRowKeys([]);
    message.success('删除成功');
  };

  const exportData = () => {
    downloadCsv(
      `字典数据_${dayjs().format('YYYYMMDD_HHmmss')}.csv`,
      ['字典类型', '字典标签', '字典键值', '字典排序', '回显样式', '备注', '创建时间', '最后更新时间', '最后更新人'],
      filteredData.map((d) => [
        d.dictType,
        d.label,
        d.value,
        d.sort,
        d.listClass,
        d.remark ?? '',
        d.createTime,
        d.updatedTime,
        d.updatedBy,
      ])
    );
  };

  const handleDataSearch = () => {
    const values = dataSearchForm.getFieldsValue();
    setDataSearchValues(values);
    if (values.dictType) setSelectedDictType(values.dictType);
  };

  const handleDataReset = () => {
    dataSearchForm.resetFields();
    setDataSearchValues({});
  };

  const typeColumns: ColumnsType<DictTypeItem> = [
    { title: '字典名称', dataIndex: 'name', key: 'name', ellipsis: true },
    {
      title: '字典类型',
      dataIndex: 'type',
      key: 'type',
      ellipsis: true,
      render: (value: string) => <a onClick={() => { setSelectedDictType(value); setActiveTab('data'); }}>{value}</a>,
    },
    { title: '状态', dataIndex: 'status', key: 'status', width: 110, render: (v: Status) => statusTag(v) },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
    { title: '最后更新时间', dataIndex: 'updatedTime', key: 'updatedTime', width: 170 },
    { title: '最后更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, record) => (
        <Space size={10}>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditType(record)} />
          <Popconfirm title="确认删除该字典类型？" onConfirm={() => deleteTypesByIds([record.id])}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dataColumns: ColumnsType<DictDataItem> = [
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
      width: 90,
      render: (_: unknown, record) => (
        <Space size={10}>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditData(record)} />
          <Popconfirm title="确认删除该字典数据？" onConfirm={() => deleteDataByIds([record.id])}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="字典管理">
      <div style={{ padding: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'types' | 'data')}
          items={[
            {
              key: 'types',
              label: '字典类型',
              children: (
                <>
                  <Card bordered={false} bodyStyle={{ padding: '16px 24px' }}>
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
                          <Button type="primary" icon={<SearchOutlined />} onClick={handleTypeSearch}>
                            搜索
                          </Button>
                          <Button icon={<ReloadOutlined />} onClick={handleTypeReset}>
                            重置
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  </Card>

                  <Card bordered={false} bodyStyle={{ padding: '16px 24px 24px' }} style={{ marginTop: 16 }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                      <Space>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openAddType}>
                          新增
                        </Button>
                        <Button icon={<EditOutlined />} onClick={openEditTypeBySelection}>
                          修改
                        </Button>
                        <Popconfirm
                          title="确认删除选中的字典类型？"
                          onConfirm={() => deleteTypesByIds(selectedTypeRowKeys)}
                          disabled={!selectedTypeRowKeys.length}
                        >
                          <Button danger icon={<DeleteOutlined />} disabled={!selectedTypeRowKeys.length}>
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
                      columns={typeColumns}
                      dataSource={filteredTypes}
                      rowKey="id"
                      loading={typeLoading}
                      rowSelection={{
                        selectedRowKeys: selectedTypeRowKeys,
                        onChange: (keys) => setSelectedTypeRowKeys(keys),
                      }}
                      pagination={{ pageSize: 10, showSizeChanger: true }}
                      size="middle"
                      onRow={(record) => ({
                        onClick: () => setSelectedDictType(record.type),
                        onDoubleClick: () => {
                          setSelectedDictType(record.type);
                          setActiveTab('data');
                          dataSearchForm.setFieldsValue({ dictType: record.type });
                        },
                      })}
                    />
                  </Card>
                </>
              ),
            },
            {
              key: 'data',
              label: '字典数据',
              children: (
                <>
                  <Card bordered={false} bodyStyle={{ padding: '16px 24px' }}>
                    <Form form={dataSearchForm} layout="inline">
                      <Form.Item name="dictType" label="字典名称" initialValue={selectedDictType || undefined}>
                        <Select
                          placeholder="请选择字典"
                          style={{ width: 220 }}
                          options={dictTypeOptions}
                          onChange={(v) => {
                            setSelectedDictType(v);
                            setDataSearchValues((prev) => ({ ...prev, dictType: v }));
                          }}
                        />
                      </Form.Item>
                      <Form.Item name="label" label="字典标签">
                        <Input placeholder="请输入字典标签" allowClear style={{ width: 220 }} />
                      </Form.Item>
                      <Form.Item>
                        <Space>
                          <Button type="primary" icon={<SearchOutlined />} onClick={handleDataSearch}>
                            搜索
                          </Button>
                          <Button icon={<ReloadOutlined />} onClick={handleDataReset}>
                            重置
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  </Card>

                  <Card bordered={false} bodyStyle={{ padding: '16px 24px 24px' }} style={{ marginTop: 16 }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                      <Space>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openAddData}>
                          新增
                        </Button>
                        <Button icon={<EditOutlined />} onClick={openEditDataBySelection}>
                          修改
                        </Button>
                        <Popconfirm
                          title="确认删除选中的字典数据？"
                          onConfirm={() => deleteDataByIds(selectedDataRowKeys)}
                          disabled={!selectedDataRowKeys.length}
                        >
                          <Button danger icon={<DeleteOutlined />} disabled={!selectedDataRowKeys.length}>
                            删除
                          </Button>
                        </Popconfirm>
                        <Button icon={<DownloadOutlined />} onClick={exportData}>
                          导出
                        </Button>
                        <Button
                          icon={<CloseOutlined />}
                          onClick={() => {
                            setActiveTab('types');
                            setSelectedDataRowKeys([]);
                          }}
                        >
                          关闭
                        </Button>
                      </Space>
                    </div>

                    <Table
                      columns={dataColumns}
                      dataSource={filteredData}
                      rowKey="id"
                      loading={dataLoading}
                      rowSelection={{
                        selectedRowKeys: selectedDataRowKeys,
                        onChange: (keys) => setSelectedDataRowKeys(keys),
                      }}
                      pagination={{ pageSize: 10, showSizeChanger: true }}
                      size="middle"
                    />
                  </Card>
                </>
              ),
            },
          ]}
        />

        <Modal title={typeModalTitle} open={typeModalOpen} onOk={submitType} onCancel={() => setTypeModalOpen(false)} width={600}>
          <Form form={typeForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item name="name" label="字典名称" rules={[{ required: true, message: '请输入字典名称' }]}>
              <Input placeholder="请输入字典名称" />
            </Form.Item>
            <Form.Item name="type" label="字典类型" rules={[{ required: true, message: '请输入字典类型' }]}>
              <Input placeholder="请输入字典类型" />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue="active">
              <Select
                options={[
                  { label: '正常', value: 'active' },
                  { label: '停用', value: 'inactive' },
                ]}
              />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="请输入内容" rows={3} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal title={dataModalTitle} open={dataModalOpen} onOk={submitData} onCancel={() => setDataModalOpen(false)} width={600}>
          <Form form={dataForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item name="dictType" label="字典类型" rules={[{ required: true, message: '请选择字典类型' }]}>
              <Input disabled />
            </Form.Item>
            <Form.Item name="label" label="数据标签" rules={[{ required: true, message: '请输入数据标签' }]}>
              <Input placeholder="请输入数据标签" />
            </Form.Item>
            <Form.Item name="value" label="数据键值" rules={[{ required: true, message: '请输入数据键值' }]}>
              <Input placeholder="请输入数据键值" />
            </Form.Item>
            <Form.Item name="cssClass" label="样式属性">
              <Input placeholder="请输入样式属性" />
            </Form.Item>
            <Form.Item name="sort" label="显示排序" initialValue={0}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="listClass" label="回显样式" initialValue="primary">
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
            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="请输入内容" rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}

