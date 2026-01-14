'use client';

import React, { useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  Tree,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TreeProps } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';

const { RangePicker } = DatePicker;

type RoleStatus = 'active' | 'inactive';

interface RoleType {
  id: string;
  name: string;
  key: string;
  order: number;
  status: RoleStatus;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
  remark?: string;
  menuKeys: string[];
}

type MenuTreeNode = {
  title: string;
  key: string;
  children?: MenuTreeNode[];
};

const menuTreeData: MenuTreeNode[] = [
  {
    title: '系统管理',
    key: 'system',
    children: [
      { title: '用户管理', key: 'system:user:list' },
      { title: '角色管理', key: 'system:role:list' },
      { title: '菜单管理', key: 'system:menu:list' },
      { title: '产品管理', key: 'system:dept:list' },
      { title: '岗位管理', key: 'system:post:list' },
      { title: '字典管理', key: 'system:dict:list' },
      { title: '参数设置', key: 'system:config:list' },
      { title: '通知公告', key: 'system:notice:list' },
      { title: '日志管理', key: 'system:log:list' },
      { title: '文件管理', key: 'system:file:list' },
    ],
  },
  {
    title: '测试管理',
    key: 'test',
    children: [
      { title: '测试用例管理', key: 'test:cases:list' },
      { title: '测试需求管理', key: 'test:requirements:list' },
      { title: '测试计划管理', key: 'test:plans:list' },
      { title: '测试执行管理', key: 'test:execution:list' },
      { title: '测试报告管理', key: 'test:reports:list' },
    ],
  },
];

const initialData: RoleType[] = [
  {
    id: '1',
    name: '超级管理员',
    key: 'superadmin',
    order: 1,
    status: 'active',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
    menuKeys: ['system', 'system:role:list', 'system:menu:list', 'system:user:list', 'test'],
  },
  {
    id: '2',
    name: '产品测试管理员',
    key: 'pmadm',
    order: 3,
    status: 'active',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
    menuKeys: ['test', 'test:cases:list', 'test:requirements:list', 'test:plans:list'],
  },
  {
    id: '3',
    name: '系统用户',
    key: 'usr',
    order: 4,
    status: 'active',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
    menuKeys: ['system', 'system:user:list'],
  },
];

const getAllMenuKeys = (nodes: MenuTreeNode[]) => {
  const keys: string[] = [];
  const walk = (list: MenuTreeNode[]) => {
    list.forEach((n) => {
      keys.push(n.key);
      if (n.children?.length) walk(n.children);
    });
  };
  walk(nodes);
  return keys;
};

export default function RolePage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const allMenuKeys = useMemo(() => getAllMenuKeys(menuTreeData), []);

  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<RoleType[]>(initialData);
  const [data, setData] = useState<RoleType[]>(initialData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加角色');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [menuCheckedKeys, setMenuCheckedKeys] = useState<React.Key[]>([]);
  const [menuExpandedKeys, setMenuExpandedKeys] = useState<React.Key[]>(allMenuKeys);
  const [expandAll, setExpandAll] = useState(true);
  const [checkAll, setCheckAll] = useState(false);
  const [parentChildLinkage, setParentChildLinkage] = useState(true);

  const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

  const getNextId = (items: RoleType[]) => {
    const maxId = items.reduce((max, cur) => Math.max(max, Number(cur.id) || 0), 0);
    return String(maxId + 1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const syncCheckedAll = (nextCheckedKeys: React.Key[]) => {
    const nextCheckAll = allMenuKeys.length > 0 && nextCheckedKeys.length === allMenuKeys.length;
    setCheckAll(nextCheckAll);
  };

  const openAdd = () => {
    setModalTitle('添加角色');
    setEditingId(null);
    form.resetFields();
    setMenuCheckedKeys([]);
    setCheckAll(false);
    setExpandAll(true);
    setMenuExpandedKeys(allMenuKeys);
    setParentChildLinkage(true);
    setIsModalOpen(true);
  };

  const openEdit = (record: RoleType) => {
    setModalTitle('修改角色');
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      key: record.key,
      order: record.order,
      status: record.status,
      remark: record.remark,
    });
    setMenuCheckedKeys(record.menuKeys);
    syncCheckedAll(record.menuKeys);
    setExpandAll(true);
    setMenuExpandedKeys(allMenuKeys);
    setParentChildLinkage(true);
    setIsModalOpen(true);
  };

  const updateRecordById = (items: RoleType[], id: string, updater: (r: RoleType) => RoleType) =>
    items.map((r) => (r.id === id ? updater(r) : r));

  const handleDelete = (ids: string[]) => {
    const nextAllData = allData.filter((r) => !ids.includes(r.id));
    setAllData(nextAllData);
    setData((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelectedRowKeys((prev) => prev.filter((k) => !ids.includes(String(k))));
    message.success('删除成功（模拟）');
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return;
    handleDelete(selectedRowKeys.map(String));
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue() as {
      name?: string;
      key?: string;
      status?: RoleStatus;
      createTime?: [Dayjs, Dayjs];
    };

    const filtered = allData.filter((r) => {
      const nameOk = values.name ? r.name.includes(values.name.trim()) : true;
      const keyOk = values.key ? r.key.includes(values.key.trim()) : true;
      const statusOk = values.status ? r.status === values.status : true;

      const createTimeOk = values.createTime?.length
        ? (() => {
            const [start, end] = values.createTime!;
            const t = dayjs(r.createTime);
            return t.isAfter(start.startOf('day').subtract(1, 'millisecond')) && t.isBefore(end.endOf('day').add(1, 'millisecond'));
          })()
        : true;

      return nameOk && keyOk && statusOk && createTimeOk;
    });

    setData(filtered);
    message.success('搜索完成');
  };

  const handleReset = () => {
    searchForm.resetFields();
    setData(allData);
  };

  const handleExport = () => {
    message.success('导出成功（模拟）');
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setLoading(true);

    setTimeout(() => {
      const updatedTime = nowText();
      const updatedBy = '管理员';
      const nextMenuKeys = menuCheckedKeys.map(String);

      if (editingId) {
        const nextAllData = updateRecordById(allData, editingId, (r) => ({
          ...r,
          name: values.name,
          key: values.key,
          order: values.order ?? 1,
          status: values.status,
          remark: values.remark,
          menuKeys: nextMenuKeys,
          updatedTime,
          updatedBy,
        }));
        setAllData(nextAllData);
        setData((prev) =>
          updateRecordById(prev, editingId, (r) => ({
            ...r,
            name: values.name,
            key: values.key,
            order: values.order ?? 1,
            status: values.status,
            remark: values.remark,
            menuKeys: nextMenuKeys,
            updatedTime,
            updatedBy,
          }))
        );
      } else {
        const id = getNextId(allData);
        const createTime = updatedTime;
        const newRole: RoleType = {
          id,
          name: values.name,
          key: values.key,
          order: values.order ?? 1,
          status: values.status,
          remark: values.remark,
          createTime,
          updatedTime,
          updatedBy,
          menuKeys: nextMenuKeys,
        };
        const nextAllData = [newRole, ...allData];
        setAllData(nextAllData);
        setData([newRole, ...data]);
      }

      setLoading(false);
      closeModal();
      message.success(`${modalTitle}成功（模拟）`);
    }, 400);
  };

  const toggleStatus = (record: RoleType, checked: boolean) => {
    const updatedTime = nowText();
    const updatedBy = '管理员';
    const nextStatus: RoleStatus = checked ? 'active' : 'inactive';

    setAllData((prev) =>
      updateRecordById(prev, record.id, (r) => ({ ...r, status: nextStatus, updatedTime, updatedBy }))
    );
    setData((prev) =>
      updateRecordById(prev, record.id, (r) => ({ ...r, status: nextStatus, updatedTime, updatedBy }))
    );
  };

  const handleMenuCheck: TreeProps['onCheck'] = (checked) => {
    const nextCheckedKeys = Array.isArray(checked) ? checked : checked.checked;
    setMenuCheckedKeys(nextCheckedKeys);
    syncCheckedAll(nextCheckedKeys);
  };

  const columns: ColumnsType<RoleType> = [
    { title: '角色名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '权限字符', dataIndex: 'key', key: 'key', width: 180 },
    { title: '显示顺序', dataIndex: 'order', key: 'order', width: 100, align: 'center' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.status === 'active'}
          onChange={(checked) => toggleStatus(record, checked)}
        />
      ),
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 200 },
    { title: '最后更新时间', dataIndex: 'updatedTime', key: 'updatedTime', width: 200 },
    { title: '最后更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 140 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="修改">
            <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除该角色吗？" onConfirm={() => handleDelete([record.id])}>
            <Tooltip title="删除">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="数据权限">
            <Button
              type="link"
              icon={<KeyOutlined />}
              onClick={() => message.info(`数据权限：${record.name}（模拟）`)}
            />
          </Tooltip>
          <Tooltip title="分配用户">
            <Button
              type="link"
              icon={<UserAddOutlined />}
              onClick={() => message.info(`分配用户：${record.name}（模拟）`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const selectedRole = selectedRowKeys.length === 1 ? allData.find((r) => r.id === String(selectedRowKeys[0])) : undefined;

  return (
    <MainLayout title="角色管理">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="name" label="角色名称">
              <Input placeholder="请输入角色名称" allowClear style={{ width: 220 }} />
            </Form.Item>
            <Form.Item name="key" label="权限字符">
              <Input placeholder="请输入权限字符" allowClear style={{ width: 220 }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="角色状态" allowClear style={{ width: 160 }}>
                <Select.Option value="active">正常</Select.Option>
                <Select.Option value="inactive">停用</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="createTime" label="创建时间">
              <RangePicker allowClear style={{ width: 300 }} />
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
              <Button
                disabled={selectedRowKeys.length !== 1}
                icon={<EditOutlined />}
                onClick={() => selectedRole && openEdit(selectedRole)}
              >
                修改
              </Button>
              <Popconfirm title="确定删除选中角色吗？" onConfirm={handleBatchDelete} disabled={selectedRowKeys.length === 0}>
                <Button danger disabled={selectedRowKeys.length === 0} icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
            </Space>
            <Space>
              <Button type="text" icon={<SearchOutlined />} onClick={handleSearch} />
              <Button type="text" icon={<ReloadOutlined />} onClick={handleReset} />
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            size="middle"
            scroll={{ x: 1400 }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            pagination={{
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: true,
              showQuickJumper: true,
              defaultPageSize: 10,
            }}
          />
        </Card>

        <Modal
          title={modalTitle}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={closeModal}
          width={720}
          confirmLoading={loading}
          okText="确定"
          cancelText="取消"
        >
          <Form form={form} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} initialValues={{ order: 1, status: 'active' }}>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
                <Input placeholder="请输入角色名称" />
              </Form.Item>
              <Form.Item name="key" label="权限字符" rules={[{ required: true, message: '请输入权限字符' }]}>
                <Input placeholder="请输入权限字符" />
              </Form.Item>
              <Form.Item name="order" label="角色顺序" rules={[{ required: true, message: '请输入角色顺序' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="status" label="状态">
                <Radio.Group>
                  <Radio value="active">正常</Radio>
                  <Radio value="inactive">停用</Radio>
                </Radio.Group>
              </Form.Item>
            </div>

            <Form.Item label="菜单权限">
              <div style={{ width: '100%' }}>
                <Space style={{ marginBottom: 8 }} wrap>
                  <Checkbox
                    checked={expandAll}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setExpandAll(next);
                      setMenuExpandedKeys(next ? allMenuKeys : []);
                    }}
                  >
                    展开/折叠
                  </Checkbox>
                  <Checkbox
                    checked={checkAll}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setCheckAll(next);
                      const nextKeys = next ? allMenuKeys : [];
                      setMenuCheckedKeys(nextKeys);
                    }}
                  >
                    全选/全不选
                  </Checkbox>
                  <Checkbox
                    checked={parentChildLinkage}
                    onChange={(e) => setParentChildLinkage(e.target.checked)}
                  >
                    父子联动
                  </Checkbox>
                </Space>

                <div style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: 12, maxHeight: 320, overflow: 'auto' }}>
                  <Tree
                    checkable
                    treeData={menuTreeData}
                    checkedKeys={menuCheckedKeys}
                    expandedKeys={menuExpandedKeys}
                    onExpand={(keys) => {
                      setMenuExpandedKeys(keys as React.Key[]);
                      setExpandAll((keys as React.Key[]).length === allMenuKeys.length);
                    }}
                    onCheck={handleMenuCheck}
                    checkStrictly={!parentChildLinkage}
                  />
                </div>
              </div>
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="请输入内容" autoSize={{ minRows: 3, maxRows: 6 }} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}
