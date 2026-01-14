'use client';

import React, { useMemo, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Switch,
  Table,
  Tree,
  TreeSelect,
  Upload,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TreeDataNode } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  KeyOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';

type DeptNode = {
  id: string;
  name: string;
  children?: DeptNode[];
};

type UserStatus = 'active' | 'inactive';

interface UserType {
  id: string;
  userName: string;
  nickName: string;
  deptId: string;
  deptName: string;
  phoneNumber?: string;
  email?: string;
  sex?: 'male' | 'female' | 'unknown';
  status: UserStatus;
  postIds?: string[];
  roleIds?: string[];
  remark?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

const deptTree: DeptNode[] = [
  {
    id: '1',
    name: '昆仓数智',
    children: [
      { id: '2', name: '昆仓ERP3.0产品' },
      { id: '3', name: '研发中心' },
      { id: '4', name: '测试中心' },
    ],
  },
];

const initialUsers: UserType[] = [
  {
    id: '1',
    userName: 'admin',
    nickName: '系统管理员',
    deptId: '1',
    deptName: '昆仓数智',
    phoneNumber: '15888888888',
    email: 'admin@example.com',
    sex: 'unknown',
    status: 'active',
    postIds: ['post_admin'],
    roleIds: ['role_admin'],
    remark: '',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '2',
    userName: 'pmadm',
    nickName: '产品测试管理员',
    deptId: '2',
    deptName: '昆仓ERP3.0产品',
    phoneNumber: '',
    email: 'pmadm@example.com',
    sex: 'unknown',
    status: 'inactive',
    postIds: ['post_test'],
    roleIds: ['role_test_admin'],
    remark: '',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

type SearchValues = {
  userName?: string;
  nickName?: string;
  phoneNumber?: string;
  status?: UserStatus;
  createTimeRange?: [Dayjs, Dayjs];
};

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const normalizeText = (v?: string) => (v ?? '').trim().toLowerCase();

const getNextId = (items: UserType[]) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

const buildDeptMaps = (items: DeptNode[]) => {
  const byId = new Map<string, DeptNode>();
  const idByName = new Map<string, string>();

  const walk = (list: DeptNode[]) => {
    list.forEach((node) => {
      byId.set(node.id, node);
      idByName.set(normalizeText(node.name), node.id);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(items);

  return { byId, idByName };
};

const getDeptDescendantIds = (items: DeptNode[], rootId: string) => {
  const ids: string[] = [];
  const walk = (list: DeptNode[]) => {
    list.forEach((node) => {
      ids.push(node.id);
      if (node.children?.length) walk(node.children);
    });
  };

  const find = (list: DeptNode[]): DeptNode | null => {
    for (const node of list) {
      if (node.id === rootId) return node;
      if (node.children?.length) {
        const hit = find(node.children);
        if (hit) return hit;
      }
    }
    return null;
  };

  const root = find(items);
  if (!root) return [];
  walk([root]);
  return ids;
};

const toTreeData = (items: DeptNode[]): TreeDataNode[] => {
  return items.map((node) => ({
    key: node.id,
    value: node.id,
    title: node.name,
    children: node.children?.length ? toTreeData(node.children) : undefined,
  }));
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

const parseCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells.map((c) => c.trim());
};

const readFileText = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file, 'utf-8');
  });
};

export default function UserPage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm<SearchValues>();

  const { byId: deptById, idByName: deptIdByName } = useMemo(() => buildDeptMaps(deptTree), []);
  const deptTreeData = useMemo(() => toTreeData(deptTree), []);

  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<UserType[]>(initialUsers);
  const [searchValues, setSearchValues] = useState<SearchValues>({});
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [deptKeyword, setDeptKeyword] = useState('');

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增用户');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const importFileList: UploadFile[] = useMemo(() => {
    if (!importFile) return [];
    return [
      {
        uid: importFile.name,
        name: importFile.name,
        status: 'done',
        originFileObj: importFile as unknown as RcFile,
      },
    ];
  }, [importFile]);

  const selectedRecords = useMemo(() => {
    const selected = new Set(selectedRowKeys.map(String));
    return allData.filter((item) => selected.has(item.id));
  }, [allData, selectedRowKeys]);

  const canEdit = selectedRecords.length === 1;
  const canDelete = selectedRowKeys.length > 0;

  const visibleDeptIds = useMemo(() => {
    if (!selectedDeptId) return null;
    return new Set(getDeptDescendantIds(deptTree, selectedDeptId));
  }, [selectedDeptId]);

  const filteredData = useMemo(() => {
    const userName = normalizeText(searchValues.userName);
    const nickName = normalizeText(searchValues.nickName);
    const phoneNumber = normalizeText(searchValues.phoneNumber);
    const status = searchValues.status;
    const range = searchValues.createTimeRange;

    return allData.filter((item) => {
      if (visibleDeptIds && !visibleDeptIds.has(item.deptId)) return false;
      if (userName && !normalizeText(item.userName).includes(userName)) return false;
      if (nickName && !normalizeText(item.nickName).includes(nickName)) return false;
      if (phoneNumber && !normalizeText(item.phoneNumber).includes(phoneNumber)) return false;
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
  }, [allData, searchValues, visibleDeptIds]);

  const deptFilteredTreeData = useMemo(() => {
    const keyword = normalizeText(deptKeyword);
    if (!keyword) return deptTreeData;

    const walk = (nodes: TreeDataNode[]): TreeDataNode[] => {
      const next: TreeDataNode[] = [];
      nodes.forEach((node) => {
        const titleText = normalizeText(String(node.title ?? ''));
        const children = node.children?.length ? walk(node.children) : undefined;
        const hit = titleText.includes(keyword);
        if (hit || (children && children.length)) {
          next.push({ ...node, children });
        }
      });
      return next;
    };

    return walk(deptTreeData);
  }, [deptKeyword, deptTreeData]);

  const openAdd = () => {
    setModalTitle('新增用户');
    setEditingId(null);
    form.resetFields();
    if (selectedDeptId) form.setFieldValue('deptId', selectedDeptId);
    form.setFieldValue('sex', 'unknown');
    form.setFieldValue('status', 'active');
    setIsModalOpen(true);
  };

  const openEdit = (record: UserType) => {
    setModalTitle('修改用户');
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      password: undefined,
    });
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

  const handleDeleteByIds = (ids: React.Key[]) => {
    if (!ids.length) return;
    setAllData((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelectedRowKeys([]);
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setTimeout(() => {
      const updatedTime = nowText();
      const updatedBy = '管理员';
      const dept = deptById.get(values.deptId as string);

      if (!dept) {
        setLoading(false);
        message.error('请选择归属部门');
        return;
      }

      if (editingId) {
        setAllData((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...item,
                  ...values,
                  deptId: dept.id,
                  deptName: dept.name,
                  updatedTime,
                  updatedBy,
                }
              : item
          )
        );
        message.success('修改成功');
      } else {
        const id = getNextId(allData);
        const record: UserType = {
          id,
          userName: values.userName,
          nickName: values.nickName,
          deptId: dept.id,
          deptName: dept.name,
          phoneNumber: values.phoneNumber,
          email: values.email,
          sex: values.sex,
          status: values.status,
          postIds: values.postIds,
          roleIds: values.roleIds,
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

  const handleExport = () => {
    const rows = filteredData.map((item) => [
      item.userName,
      item.nickName,
      item.deptName,
      item.phoneNumber ?? '',
      item.email ?? '',
      item.status === 'active' ? '正常' : '停用',
      item.createTime,
      item.updatedTime,
      item.updatedBy,
    ]);
    downloadCsv(
      `用户管理_${dayjs().format('YYYYMMDD_HHmmss')}.csv`,
      ['用户名称', '用户昵称', '部门', '手机号码', '邮箱', '状态', '创建时间', '最后更新时间', '最后更新人'],
      rows
    );
  };

  const handleDownloadTemplate = () => {
    downloadCsv(
      '用户导入模板.csv',
      ['用户名称', '用户昵称', '部门', '手机号码', '邮箱', '状态'],
      [['demo', '示例用户', '昆仓ERP3.0产品', '15800000000', 'demo@example.com', '正常']]
    );
  };

  const handleImportOpen = () => {
    setImportFile(null);
    setIsImportOpen(true);
  };

  const handleImport = async () => {
    if (!importFile) {
      message.warning('请先选择文件');
      return;
    }
    setImporting(true);
    try {
      const text = await readFileText(importFile);
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) {
        message.error('文件内容为空或缺少数据行');
        return;
      }
      const header = parseCsvLine(lines[0]);
      const index = (name: string) => header.findIndex((h) => normalizeText(h) === normalizeText(name));

      const idxUserName = index('用户名称');
      const idxNickName = index('用户昵称');
      const idxDeptName = index('部门');
      const idxPhone = index('手机号码');
      const idxEmail = index('邮箱');
      const idxStatus = index('状态');

      if (idxUserName < 0 || idxNickName < 0) {
        message.error('未识别到“用户名称/用户昵称”列，请使用模板');
        return;
      }

      const updatedTime = nowText();
      const updatedBy = '管理员';
      const nextRecords: UserType[] = [];

      for (let i = 1; i < lines.length; i += 1) {
        const row = parseCsvLine(lines[i]);
        const userName = row[idxUserName] ?? '';
        const nickName = row[idxNickName] ?? '';
        if (!userName || !nickName) continue;

        const deptName = idxDeptName >= 0 ? row[idxDeptName] ?? '' : '';
        const deptId = deptName ? deptIdByName.get(normalizeText(deptName)) : undefined;
        const dept = (deptId && deptById.get(deptId)) || deptTree[0];
        const statusText = idxStatus >= 0 ? normalizeText(row[idxStatus]) : '';
        const status: UserStatus = statusText === '停用' || statusText === 'inactive' ? 'inactive' : 'active';

        nextRecords.push({
          id: '',
          userName,
          nickName,
          deptId: dept.id,
          deptName: dept.name,
          phoneNumber: idxPhone >= 0 ? row[idxPhone] ?? '' : '',
          email: idxEmail >= 0 ? row[idxEmail] ?? '' : '',
          sex: 'unknown',
          status,
          createTime: updatedTime,
          updatedTime,
          updatedBy,
        });
      }

      if (!nextRecords.length) {
        message.warning('没有可导入的数据行');
        return;
      }

      setAllData((prev) => {
        let nextId = Number(getNextId(prev));
        const mapped = nextRecords.map((r) => ({ ...r, id: String(nextId++) }));
        return [...mapped, ...prev];
      });

      setIsImportOpen(false);
      setSelectedRowKeys([]);
      message.success(`导入成功：${nextRecords.length} 条`);
    } catch {
      message.error('导入失败，请检查文件格式');
    } finally {
      setImporting(false);
    }
  };

  const handleToggleStatus = (record: UserType, checked: boolean) => {
    const updatedTime = nowText();
    const updatedBy = '管理员';
    setAllData((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: checked ? 'active' : 'inactive',
              updatedTime,
              updatedBy,
            }
          : item
      )
    );
  };

  const handleResetPassword = (record: UserType) => {
    Modal.confirm({
      title: `确认重置 “${record.userName}” 的密码吗？`,
      content: '将重置为初始密码（模拟）',
      onOk: () => message.success('重置成功（模拟）'),
    });
  };

  const handleAssignRole = (record: UserType) => {
    Modal.info({
      title: `分配角色：${record.userName}`,
      content: '该功能为原型占位，后续可接入真实接口。',
      okText: '知道了',
    });
  };

  const moreMenu = {
    items: [
      { key: 'download', label: '下载模板', icon: <DownloadOutlined /> },
      { key: 'import', label: '导入数据', icon: <UploadOutlined /> },
      { key: 'export', label: '导出数据', icon: <DownloadOutlined /> },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'download') handleDownloadTemplate();
      if (key === 'import') handleImportOpen();
      if (key === 'export') handleExport();
    },
  };

  const columns: ColumnsType<UserType> = [
    { title: '用户名称', dataIndex: 'userName', key: 'userName', width: 140 },
    { title: '用户昵称', dataIndex: 'nickName', key: 'nickName', width: 180 },
    { title: '部门', dataIndex: 'deptName', key: 'deptName', width: 180 },
    { title: '手机号码', dataIndex: 'phoneNumber', key: 'phoneNumber', width: 150 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Switch checked={record.status === 'active'} onChange={(checked) => handleToggleStatus(record, checked)} />
      ),
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 190 },
    { title: '最后更新时间', dataIndex: 'updatedTime', key: 'updatedTime', width: 190 },
    { title: '最后更新人', dataIndex: 'updatedBy', key: 'updatedBy', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size={6}>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确定删除该用户吗？" onConfirm={() => handleDeleteByIds([record.id])}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button type="link" icon={<KeyOutlined />} onClick={() => handleResetPassword(record)} />
          <Button type="link" icon={<TeamOutlined />} onClick={() => handleAssignRole(record)} />
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="用户管理">
      <div className="p-4">
        <div className="flex gap-4">
          <Card bordered={false} style={{ width: 280 }} bodyStyle={{ padding: 16 }}>
            <Input
              placeholder="请输入部门名称"
              allowClear
              value={deptKeyword}
              onChange={(e) => setDeptKeyword(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <Tree
              treeData={deptFilteredTreeData}
              selectedKeys={selectedDeptId ? [selectedDeptId] : []}
              onSelect={(keys) => setSelectedDeptId(keys.length ? String(keys[0]) : null)}
              defaultExpandAll
            />
          </Card>

          <div className="flex-1">
            <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
              <Form form={searchForm} layout="inline">
                <Form.Item name="userName" label="用户名称">
                  <Input placeholder="请输入用户名称" allowClear style={{ width: 200 }} />
                </Form.Item>
                <Form.Item name="nickName" label="用户昵称">
                  <Input placeholder="请输入用户昵称" allowClear style={{ width: 200 }} />
                </Form.Item>
                <Form.Item name="phoneNumber" label="手机号码">
                  <Input placeholder="请输入手机号码" allowClear style={{ width: 200 }} />
                </Form.Item>
                <Form.Item name="status" label="状态">
                  <Select placeholder="用户状态" allowClear style={{ width: 160 }}>
                    <Select.Option value="active">正常</Select.Option>
                    <Select.Option value="inactive">停用</Select.Option>
                  </Select>
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
                  <Button
                    icon={<EditOutlined />}
                    disabled={!canEdit}
                    onClick={() => {
                      const record = selectedRecords[0];
                      if (record) openEdit(record);
                    }}
                  >
                    修改
                  </Button>
                  <Popconfirm
                    title="确定删除选中的用户吗？"
                    onConfirm={() => handleDeleteByIds(selectedRowKeys)}
                    disabled={!canDelete}
                  >
                    <Button danger icon={<DeleteOutlined />} disabled={!canDelete}>
                      删除
                    </Button>
                  </Popconfirm>
                  <Dropdown menu={moreMenu} trigger={['click']}>
                    <Button icon={<MoreOutlined />}>
                      更多
                    </Button>
                  </Dropdown>
                </Space>
                <Space>
                  <Button type="text" icon={<SearchOutlined />} />
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => setLoading(false), 400);
                    }}
                  />
                </Space>
              </div>

              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                size="middle"
                scroll={{ x: 1400 }}
                pagination={{
                  total: filteredData.length,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条`,
                  defaultPageSize: 10,
                }}
                rowSelection={{
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys),
                }}
              />
            </Card>
          </div>
        </div>

        <Modal
          title={modalTitle}
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          width={680}
          confirmLoading={loading}
        >
          <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            <Form.Item
              name="nickName"
              label="用户昵称"
              rules={[{ required: true, message: '请输入用户昵称' }]}
            >
              <Input placeholder="请输入用户昵称" />
            </Form.Item>

            <Form.Item
              name="deptId"
              label="归属部门"
              rules={[{ required: true, message: '请选择归属部门' }]}
            >
              <TreeSelect
                treeData={deptTreeData}
                placeholder="请选择归属部门"
                allowClear
                treeDefaultExpandAll
              />
            </Form.Item>

            <Form.Item name="phoneNumber" label="手机号码">
              <Input placeholder="请输入手机号码" />
            </Form.Item>

            <Form.Item name="email" label="邮箱">
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              name="userName"
              label="用户名称"
              rules={[{ required: true, message: '请输入用户名称' }]}
            >
              <Input placeholder="请输入用户名称" />
            </Form.Item>

            {!editingId && (
              <Form.Item
                name="password"
                label="用户密码"
                rules={[{ required: true, message: '请输入用户密码' }]}
              >
                <Input.Password placeholder="请输入用户密码" autoComplete="new-password" />
              </Form.Item>
            )}

            <Form.Item name="sex" label="用户性别">
              <Select placeholder="请选择">
                <Select.Option value="unknown">未知</Select.Option>
                <Select.Option value="male">男</Select.Option>
                <Select.Option value="female">女</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="status" label="状态">
              <Radio.Group>
                <Radio value="active">正常</Radio>
                <Radio value="inactive">停用</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="postIds" label="岗位">
              <Select mode="multiple" placeholder="请选择">
                <Select.Option value="post_admin">系统管理员</Select.Option>
                <Select.Option value="post_dev">研发工程师</Select.Option>
                <Select.Option value="post_test">测试工程师</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="roleIds" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
              <Select mode="multiple" placeholder="请选择">
                <Select.Option value="role_admin">系统管理员</Select.Option>
                <Select.Option value="role_test_admin">产品测试管理员</Select.Option>
                <Select.Option value="role_user">普通用户</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="请输入内容" rows={3} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="导入数据"
          open={isImportOpen}
          onOk={handleImport}
          onCancel={() => setIsImportOpen(false)}
          confirmLoading={importing}
          okText="导入"
          width={560}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Upload
              accept=".csv"
              beforeUpload={(file) => {
                setImportFile(file);
                return false;
              }}
              maxCount={1}
              onRemove={() => setImportFile(null)}
              fileList={importFileList}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
            <div>
              <Button type="link" icon={<DownloadOutlined />} onClick={handleDownloadTemplate} style={{ padding: 0 }}>
                下载模板
              </Button>
            </div>
          </Space>
        </Modal>
      </div>
    </MainLayout>
  );
}
