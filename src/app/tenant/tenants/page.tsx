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
  Switch,
  Table,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';

type TenantStatus = 'active' | 'inactive';

type TenantPackageOption = {
  id: string;
  name: string;
};

interface TenantType {
  id: string;
  tenantCode: string;
  contactName: string;
  contactPhone: string;
  companyName: string;
  creditCode?: string;
  expireTime?: string;
  status: TenantStatus;
  packageId?: string;
  userCount?: number;
  bindDomain?: string;
  companyAddress?: string;
  companyCode?: string;
  companyIntro?: string;
  remark?: string;
  adminUserName?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

type SearchValues = {
  tenantCode?: string;
  contactName?: string;
  contactPhone?: string;
  companyName?: string;
};

type FormValues = {
  companyName: string;
  contactName: string;
  contactPhone: string;
  adminUserName: string;
  adminPassword?: string;
  packageId?: string;
  expireTime?: Dayjs | null;
  userCount?: number;
  bindDomain?: string;
  companyAddress?: string;
  companyCode?: string;
  creditCode?: string;
  companyIntro?: string;
  remark?: string;
  status?: TenantStatus;
};

const tenantPackageOptions: TenantPackageOption[] = [
  { id: 'pkg_1', name: '基础版' },
  { id: 'pkg_2', name: '标准版' },
  { id: 'pkg_3', name: '企业版' },
];

const initialTenants: TenantType[] = [
  {
    id: '1',
    tenantCode: '000000',
    contactName: '管理组',
    contactPhone: '15888888888',
    companyName: '昆仓数智',
    creditCode: '',
    expireTime: '',
    status: 'active',
    packageId: 'pkg_2',
    userCount: 0,
    bindDomain: '',
    companyAddress: '',
    companyCode: '',
    companyIntro: '',
    remark: '',
    adminUserName: 'admin',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const normalizeText = (v?: string) => (v ?? '').trim().toLowerCase();

const getNextId = (items: TenantType[]) => {
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

export default function TenantManagementPage() {
  const [form] = Form.useForm<FormValues>();
  const [searchForm] = Form.useForm<SearchValues>();

  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<TenantType[]>(initialTenants);
  const [searchValues, setSearchValues] = useState<SearchValues>({});

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增租户');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const filteredData = useMemo(() => {
    const tenantCode = normalizeText(searchValues.tenantCode);
    const contactName = normalizeText(searchValues.contactName);
    const contactPhone = normalizeText(searchValues.contactPhone);
    const companyName = normalizeText(searchValues.companyName);

    return allData.filter((row) => {
      if (tenantCode && !normalizeText(row.tenantCode).includes(tenantCode)) return false;
      if (contactName && !normalizeText(row.contactName).includes(contactName)) return false;
      if (contactPhone && !normalizeText(row.contactPhone).includes(contactPhone)) return false;
      if (companyName && !normalizeText(row.companyName).includes(companyName)) return false;
      return true;
    });
  }, [allData, searchValues]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSearch = () => {
    setSearchValues(searchForm.getFieldsValue());
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchValues({});
  };

  const handleAdd = () => {
    setModalTitle('新增租户');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active', userCount: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (record: TenantType) => {
    setModalTitle('修改租户');
    setEditingId(record.id);
    form.setFieldsValue({
      companyName: record.companyName,
      contactName: record.contactName,
      contactPhone: record.contactPhone,
      adminUserName: record.adminUserName || '',
      packageId: record.packageId,
      expireTime: record.expireTime ? dayjs(record.expireTime) : null,
      userCount: record.userCount ?? 0,
      bindDomain: record.bindDomain,
      companyAddress: record.companyAddress,
      companyCode: record.companyCode,
      creditCode: record.creditCode,
      companyIntro: record.companyIntro,
      remark: record.remark,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleBulkEdit = () => {
    if (selectedRowKeys.length !== 1) return;
    const target = allData.find((row) => row.id === String(selectedRowKeys[0]));
    if (target) handleEdit(target);
  };

  const handleDeleteIds = (ids: string[]) => {
    if (!ids.length) return;
    setAllData((prev) => prev.filter((row) => !ids.includes(row.id)));
    setSelectedRowKeys((prev) => prev.filter((key) => !ids.includes(String(key))));
    message.success('删除成功（模拟）');
  };

  const handleExport = () => {
    const ids = selectedRowKeys.map((k) => String(k));
    const rows = (ids.length ? filteredData.filter((row) => ids.includes(row.id)) : filteredData).map((row) => [
      row.tenantCode,
      row.contactName,
      row.contactPhone,
      row.companyName,
      row.creditCode ?? '',
      row.expireTime ?? '',
      row.status === 'active' ? '正常' : '停用',
      row.updatedTime,
      row.updatedBy,
    ]);

    downloadCsv(
      `租户管理_${dayjs().format('YYYYMMDD_HHmmss')}.csv`,
      ['租户编号', '联系人', '联系电话', '企业名称', '社会信用代码', '过期时间', '租户状态', '最后更新时间', '最后更新人'],
      rows
    );
    message.success('导出成功（模拟）');
  };

  const updateTenantById = (id: string, updater: (prev: TenantType) => TenantType) => {
    setAllData((prev) => prev.map((row) => (row.id === id ? updater(row) : row)));
  };

  const handleSyncTenant = async (record?: TenantType) => {
    setSyncing(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (record) {
        updateTenantById(record.id, (prev) => ({
          ...prev,
          updatedTime: nowText(),
          updatedBy: '管理员',
        }));
      }
      message.success('同步成功（模拟）');
    } finally {
      setSyncing(false);
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setTimeout(() => {
      const updatedTime = nowText();
      const updatedBy = '管理员';

      if (editingId) {
        setAllData((prev) =>
          prev.map((row) => {
            if (row.id !== editingId) return row;
            return {
              ...row,
              companyName: values.companyName,
              contactName: values.contactName,
              contactPhone: values.contactPhone,
              adminUserName: values.adminUserName,
              packageId: values.packageId,
              expireTime: values.expireTime ? values.expireTime.format('YYYY-MM-DD') : '',
              userCount: values.userCount ?? 0,
              bindDomain: values.bindDomain ?? '',
              companyAddress: values.companyAddress ?? '',
              companyCode: values.companyCode ?? '',
              creditCode: values.creditCode ?? '',
              companyIntro: values.companyIntro ?? '',
              remark: values.remark ?? '',
              status: values.status ?? 'active',
              updatedTime,
              updatedBy,
            };
          })
        );
      } else {
        const id = getNextId(allData);
        const tenantCode = String(1000000 + Number(id)).slice(-6);
        const createTime = updatedTime;
        const newRow: TenantType = {
          id,
          tenantCode,
          companyName: values.companyName,
          contactName: values.contactName,
          contactPhone: values.contactPhone,
          adminUserName: values.adminUserName,
          packageId: values.packageId,
          expireTime: values.expireTime ? values.expireTime.format('YYYY-MM-DD') : '',
          userCount: values.userCount ?? 0,
          bindDomain: values.bindDomain ?? '',
          companyAddress: values.companyAddress ?? '',
          companyCode: values.companyCode ?? '',
          creditCode: values.creditCode ?? '',
          companyIntro: values.companyIntro ?? '',
          remark: values.remark ?? '',
          status: values.status ?? 'active',
          createTime,
          updatedTime,
          updatedBy,
        };
        setAllData((prev) => [newRow, ...prev]);
      }

      setLoading(false);
      closeModal();
      message.success(`${modalTitle}成功（模拟）`);
    }, 500);
  };

  const columns: ColumnsType<TenantType> = [
    { title: '租户编号', dataIndex: 'tenantCode', key: 'tenantCode', width: 120 },
    { title: '联系人', dataIndex: 'contactName', key: 'contactName', width: 140 },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone', width: 160 },
    { title: '企业名称', dataIndex: 'companyName', key: 'companyName', width: 220 },
    { title: '社会信用代码', dataIndex: 'creditCode', key: 'creditCode', width: 180 },
    { title: '过期时间', dataIndex: 'expireTime', key: 'expireTime', width: 140 },
    {
      title: '租户状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: TenantStatus, record) => (
        <Switch
          checked={status === 'active'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => {
            updateTenantById(record.id, (prev) => ({
              ...prev,
              status: checked ? 'active' : 'inactive',
              updatedTime: nowText(),
              updatedBy: '管理员',
            }));
          }}
        />
      ),
    },
    { title: '最后更新时间', dataIndex: 'updatedTime', key: 'updatedTime', width: 180 },
    { title: '最后更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" icon={<ReloadOutlined />} loading={syncing} onClick={() => handleSyncTenant(record)} />
          <Popconfirm title="确定删除该租户吗？" onConfirm={() => handleDeleteIds([record.id])}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="租户管理">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="tenantCode" label="租户编号">
              <Input placeholder="请输入租户编号" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="contactName" label="联系人">
              <Input placeholder="请输入联系人" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="contactPhone" label="联系电话">
              <Input placeholder="请输入联系电话" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item name="companyName" label="企业名称">
              <Input placeholder="请输入企业名称" allowClear style={{ width: 220 }} />
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
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增
              </Button>
              <Button
                icon={<EditOutlined />}
                disabled={selectedRowKeys.length !== 1}
                onClick={handleBulkEdit}
              >
                修改
              </Button>
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 条租户吗？`}
                disabled={selectedRowKeys.length === 0}
                onConfirm={() => handleDeleteIds(selectedRowKeys.map((k) => String(k)))}
              >
                <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
                  删除
                </Button>
              </Popconfirm>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
              <Button icon={<SyncOutlined />} loading={syncing} onClick={() => handleSyncTenant()}>
                同步租户字典
              </Button>
              <Button icon={<SyncOutlined />} loading={syncing} onClick={() => handleSyncTenant()}>
                同步租户参数配置
              </Button>
            </Space>
            <Space>
              <Button type="text" icon={<SearchOutlined />} />
              <Button type="text" icon={<ReloadOutlined />} onClick={() => setSearchValues({ ...searchValues })} />
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
            scroll={{ x: 1400 }}
            size="middle"
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>

        <Modal
          title={modalTitle}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={closeModal}
          width={720}
          confirmLoading={loading}
        >
          <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item name="companyName" label="企业名称" rules={[{ required: true, message: '请输入企业名称' }]}>
              <Input placeholder="请输入企业名称" />
            </Form.Item>
            <Form.Item name="contactName" label="联系人" rules={[{ required: true, message: '请输入联系人' }]}>
              <Input placeholder="请输入联系人" />
            </Form.Item>
            <Form.Item name="contactPhone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
              <Input placeholder="请输入联系电话" />
            </Form.Item>
            <Form.Item name="adminUserName" label="用户名" rules={[{ required: true, message: '请输入系统用户名' }]}>
              <Input placeholder="请输入系统用户名" />
            </Form.Item>
            {editingId ? (
              <Form.Item name="adminPassword" label="用户密码">
                <Input.Password placeholder="留空表示不修改" />
              </Form.Item>
            ) : (
              <Form.Item name="adminPassword" label="用户密码" rules={[{ required: true, message: '请输入系统用户密码' }]}>
                <Input.Password placeholder="请输入系统用户密码" />
              </Form.Item>
            )}
            <Form.Item name="packageId" label="租户套餐">
              <Select
                placeholder="请选择租户套餐"
                allowClear
                options={tenantPackageOptions.map((opt) => ({ value: opt.id, label: opt.name }))}
              />
            </Form.Item>
            <Form.Item name="expireTime" label="过期时间">
              <DatePicker style={{ width: '100%' }} placeholder="请选择过期时间" />
            </Form.Item>
            <Form.Item name="userCount" label="用户数量" initialValue={0}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="bindDomain" label="绑定域名">
              <Input placeholder="请输入绑定域名" />
            </Form.Item>
            <Form.Item name="companyAddress" label="企业地址">
              <Input placeholder="请输入企业地址" />
            </Form.Item>
            <Form.Item name="companyCode" label="企业代码">
              <Input placeholder="请输入企业代码" />
            </Form.Item>
            <Form.Item name="creditCode" label="企业代码/社会信用代码">
              <Input placeholder="请输入统一社会信用代码" />
            </Form.Item>
            <Form.Item name="companyIntro" label="企业简介">
              <Input.TextArea placeholder="请输入企业简介" rows={3} />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input placeholder="请输入备注" />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue="active">
              <Select
                options={[
                  { value: 'active', label: '正常' },
                  { value: 'inactive', label: '停用' },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}
