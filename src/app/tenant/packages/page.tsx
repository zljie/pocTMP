'use client';

import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tree,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TreeDataNode } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';

type PackageStatus = 'active' | 'inactive';

interface TenantPackageType {
  id: string;
  name: string;
  remark?: string;
  status: PackageStatus;
  menuKeys: string[];
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

type SearchValues = {
  name?: string;
};

type FormValues = {
  name: string;
  remark?: string;
  status?: PackageStatus;
};

const menuTreeData: TreeDataNode[] = [
  {
    key: 'system',
    title: '系统管理',
    children: [
      { key: 'system:user', title: '用户管理' },
      { key: 'system:role', title: '角色管理' },
      { key: 'system:menu', title: '菜单管理' },
      { key: 'system:product', title: '产品管理' },
      { key: 'system:post', title: '岗位管理' },
      { key: 'system:dict', title: '字典管理' },
      { key: 'system:config', title: '参数设置' }
    ],
  },
  {
    key: 'testing',
    title: '测试菜单',
    children: [
      { key: 'testing:cases', title: '测试用例管理' },
      { key: 'testing:req', title: '测试需求管理' },
      { key: 'testing:plans', title: '测试计划管理' },
      { key: 'testing:exec', title: '测试执行管理' },
      { key: 'testing:reports', title: '测试报告管理' },
      { key: 'testing:web', title: 'Web自动化测试' },
      { key: 'testing:perf', title: '性能测试' },
      { key: 'testing:api', title: '接口测试' },
      { key: 'testing:task', title: '测试任务管理' },
    ],
  },
];

const initialPackages: TenantPackageType[] = [];

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const normalizeText = (v?: string) => (v ?? '').trim().toLowerCase();

const getNextId = (items: TenantPackageType[]) => {
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

const collectTreeKeys = (nodes: TreeDataNode[]) => {
  const keys: React.Key[] = [];
  const walk = (list: TreeDataNode[]) => {
    list.forEach((node) => {
      keys.push(node.key);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(nodes);
  return keys;
};

const allMenuKeys = collectTreeKeys(menuTreeData).map((k) => String(k));

export default function TenantPackageManagementPage() {
  const [form] = Form.useForm<FormValues>();
  const [searchForm] = Form.useForm<SearchValues>();

  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<TenantPackageType[]>(initialPackages);
  const [searchValues, setSearchValues] = useState<SearchValues>({});

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增租户套餐');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(allMenuKeys);
  const [checkedMenuKeys, setCheckedMenuKeys] = useState<React.Key[]>([]);
  const [expandAll, setExpandAll] = useState(true);
  const [checkAll, setCheckAll] = useState(false);
  const [parentChildLink, setParentChildLink] = useState(true);

  const filteredData = useMemo(() => {
    const name = normalizeText(searchValues.name);
    return allData.filter((row) => {
      if (name && !normalizeText(row.name).includes(name)) return false;
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

  const resetTreeState = () => {
    setExpandedKeys(allMenuKeys);
    setCheckedMenuKeys([]);
    setExpandAll(true);
    setCheckAll(false);
    setParentChildLink(true);
  };

  const handleAdd = () => {
    setModalTitle('新增租户套餐');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    resetTreeState();
    setIsModalOpen(true);
  };

  const handleEdit = (record: TenantPackageType) => {
    setModalTitle('修改租户套餐');
    setEditingId(record.id);
    form.setFieldsValue({ name: record.name, remark: record.remark, status: record.status });
    setCheckedMenuKeys(record.menuKeys);
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
      row.name,
      row.remark ?? '',
      row.status === 'active' ? '正常' : '停用',
      row.updatedTime,
      row.updatedBy,
    ]);

    downloadCsv(
      `租户套餐管理_${dayjs().format('YYYYMMDD_HHmmss')}.csv`,
      ['套餐名称', '备注', '状态', '最后更新时间', '最后更新人'],
      rows
    );
    message.success('导出成功（模拟）');
  };

  const updatePackageById = (id: string, updater: (prev: TenantPackageType) => TenantPackageType) => {
    setAllData((prev) => prev.map((row) => (row.id === id ? updater(row) : row)));
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setTimeout(() => {
      const updatedTime = nowText();
      const updatedBy = '管理员';
      const menuKeys = checkedMenuKeys.map((k) => String(k));

      if (editingId) {
        setAllData((prev) =>
          prev.map((row) => {
            if (row.id !== editingId) return row;
            return {
              ...row,
              name: values.name,
              remark: values.remark ?? '',
              status: values.status ?? 'active',
              menuKeys,
              updatedTime,
              updatedBy,
            };
          })
        );
      } else {
        const id = getNextId(allData);
        const createTime = updatedTime;
        const newRow: TenantPackageType = {
          id,
          name: values.name,
          remark: values.remark ?? '',
          status: values.status ?? 'active',
          menuKeys,
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

  const columns: ColumnsType<TenantPackageType> = [
    { title: '套餐名称', dataIndex: 'name', key: 'name', width: 260 },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: PackageStatus, record) => (
        <Switch
          checked={status === 'active'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => {
            updatePackageById(record.id, (prev) => ({
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
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除该套餐吗？" onConfirm={() => handleDeleteIds([record.id])}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="租户套餐管理">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="name" label="套餐名称">
              <Input placeholder="请输入套餐名称" allowClear style={{ width: 240 }} />
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
              <Button icon={<EditOutlined />} disabled={selectedRowKeys.length !== 1} onClick={handleBulkEdit}>
                修改
              </Button>
              <Popconfirm
                title={`确定删除选中的 ${selectedRowKeys.length} 条套餐吗？`}
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
            scroll={{ x: 1000 }}
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
            <Form.Item name="name" label="套餐名称" rules={[{ required: true, message: '请输入套餐名称' }]}>
              <Input placeholder="请输入套餐名称" />
            </Form.Item>

            <Form.Item label="关联菜单">
              <Space align="start" style={{ width: '100%' }}>
                <Space direction="vertical" size={6} style={{ minWidth: 110 }}>
                  <Checkbox
                    checked={expandAll}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setExpandAll(next);
                      setExpandedKeys(next ? allMenuKeys : []);
                    }}
                  >
                    展开/折叠
                  </Checkbox>
                  <Checkbox
                    checked={checkAll}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setCheckAll(next);
                      setCheckedMenuKeys(next ? allMenuKeys : []);
                    }}
                  >
                    全选/全不选
                  </Checkbox>
                  <Checkbox checked={parentChildLink} onChange={(e) => setParentChildLink(e.target.checked)}>
                    父子联动
                  </Checkbox>
                </Space>
                <div style={{ flex: 1, border: '1px solid #f0f0f0', borderRadius: 6, padding: 12, maxHeight: 260, overflow: 'auto' }}>
                  <Tree
                    checkable
                    treeData={menuTreeData}
                    expandedKeys={expandedKeys}
                    onExpand={(keys) => {
                      setExpandedKeys(keys);
                      setExpandAll(keys.length === allMenuKeys.length);
                    }}
                    checkStrictly={!parentChildLink}
                    checkedKeys={parentChildLink ? checkedMenuKeys : { checked: checkedMenuKeys, halfChecked: [] }}
                    onCheck={(keys) => {
                      if (Array.isArray(keys)) {
                        setCheckedMenuKeys(keys);
                        setCheckAll(keys.length === allMenuKeys.length);
                        return;
                      }
                      setCheckedMenuKeys(keys.checked);
                      setCheckAll(keys.checked.length === allMenuKeys.length);
                    }}
                  />
                </div>
              </Space>
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

