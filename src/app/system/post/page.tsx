'use client';

import React, { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Tree,
  TreeSelect,
  message,
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import MainLayout from '@/components/layout/MainLayout';

type Status = 'active' | 'inactive';

interface DeptType {
  id: string;
  name: string;
  parentId?: string;
  children?: DeptType[];
}

interface PostType {
  id: string;
  postCode: string;
  categoryCode?: string;
  postName: string;
  deptId: string;
  orderNum: number;
  status: Status;
  remark?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

type SearchValues = {
  postCode?: string;
  categoryCode?: string;
  postName?: string;
  deptId?: string;
  status?: Status;
  createTimeRange?: [Dayjs, Dayjs];
};

const deptTreeData: DeptType[] = [
  {
    id: '1',
    name: '昆仓数智',
    children: [
      {
        id: '2',
        parentId: '1',
        name: '昆仓ERP3.0产品',
      },
    ],
  },
];

const initialPosts: PostType[] = [
  {
    id: '1',
    postCode: 'PM',
    categoryCode: '',
    postName: '产品经理',
    deptId: '2',
    orderNum: 0,
    status: 'active',
    createTime: '2026-01-08 11:42:05',
    updatedTime: '2026-01-08 11:42:05',
    updatedBy: '管理员',
  },
  {
    id: '2',
    postCode: 'PA',
    categoryCode: '',
    postName: '产品架构师',
    deptId: '2',
    orderNum: 1,
    status: 'active',
    createTime: '2026-01-08 11:42:57',
    updatedTime: '2026-01-08 11:42:57',
    updatedBy: '管理员',
  },
  {
    id: '3',
    postCode: 'PD',
    categoryCode: '',
    postName: '产品研发负责人',
    deptId: '2',
    orderNum: 2,
    status: 'active',
    createTime: '2026-01-08 11:45:35',
    updatedTime: '2026-01-08 11:45:35',
    updatedBy: '管理员',
  },
  {
    id: '4',
    postCode: 'RD',
    categoryCode: '',
    postName: '产品开发人员',
    deptId: '2',
    orderNum: 3,
    status: 'active',
    createTime: '2026-01-08 11:46:44',
    updatedTime: '2026-01-08 11:46:44',
    updatedBy: '管理员',
  },
  {
    id: '5',
    postCode: 'TM',
    categoryCode: '',
    postName: '测试负责人',
    deptId: '2',
    orderNum: 4,
    status: 'active',
    createTime: '2026-01-08 11:49:29',
    updatedTime: '2026-01-08 11:49:29',
    updatedBy: '管理员',
  },
  {
    id: '6',
    postCode: 'FT',
    categoryCode: '',
    postName: '功能测试人员',
    deptId: '2',
    orderNum: 5,
    status: 'active',
    createTime: '2026-01-08 11:49:56',
    updatedTime: '2026-01-08 11:49:56',
    updatedBy: '管理员',
  },
];

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const normalizeText = (v?: string) => (v ?? '').trim().toLowerCase();

const buildDeptNameMap = (items: DeptType[]) => {
  const map = new Map<string, string>();
  const walk = (list: DeptType[]) => {
    list.forEach((n) => {
      map.set(n.id, n.name);
      if (n.children?.length) walk(n.children);
    });
  };
  walk(items);
  return map;
};

const mapToTreeData = (items: DeptType[]): DataNode[] => {
  return items.map((n) => ({
    key: n.id,
    title: n.name,
    children: n.children?.length ? mapToTreeData(n.children) : undefined,
  }));
};

const filterDeptTree = (items: DeptType[], keyword: string): DeptType[] => {
  const q = normalizeText(keyword);
  if (!q) return items;

  const walk = (list: DeptType[]): DeptType[] => {
    const next: DeptType[] = [];
    list.forEach((node) => {
      const nextChildren = node.children?.length ? walk(node.children) : undefined;
      const hit = normalizeText(node.name).includes(q);
      if (hit || (nextChildren && nextChildren.length)) {
        next.push({ ...node, children: nextChildren });
      }
    });
    return next;
  };

  return walk(items);
};

const collectDescendantIds = (items: DeptType[], rootId: string) => {
  const walkFind = (list: DeptType[]): DeptType | null => {
    for (const node of list) {
      if (node.id === rootId) return node;
      if (node.children?.length) {
        const found = walkFind(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const root = walkFind(items);
  if (!root) return new Set<string>([rootId]);

  const ids = new Set<string>();
  const walkCollect = (node: DeptType) => {
    ids.add(node.id);
    node.children?.forEach(walkCollect);
  };
  walkCollect(root);
  return ids;
};

const filterPosts = (items: PostType[], filters: SearchValues, deptScopeIds?: Set<string>) => {
  const postCode = normalizeText(filters.postCode);
  const categoryCode = normalizeText(filters.categoryCode);
  const postName = normalizeText(filters.postName);
  const status = filters.status;
  const createTimeRange = filters.createTimeRange;

  return items.filter((p) => {
    const okPostCode = !postCode || normalizeText(p.postCode).includes(postCode);
    const okCategoryCode = !categoryCode || normalizeText(p.categoryCode).includes(categoryCode);
    const okPostName = !postName || normalizeText(p.postName).includes(postName);
    const okStatus = !status || p.status === status;
    const okDept = !deptScopeIds || deptScopeIds.has(p.deptId);
    const okCreateTime =
      !createTimeRange ||
      !createTimeRange[0] ||
      !createTimeRange[1] ||
      (dayjs(p.createTime).valueOf() >= createTimeRange[0].startOf('day').valueOf() &&
        dayjs(p.createTime).valueOf() <= createTimeRange[1].endOf('day').valueOf());
    return okPostCode && okCategoryCode && okPostName && okStatus && okDept && okCreateTime;
  });
};

const getNextId = (items: PostType[]) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

const escapeCsv = (value: string) => {
  const v = value.replaceAll('"', '""');
  return /[",\n]/.test(v) ? `"${v}"` : v;
};

const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function PostPage() {
  const [searchForm] = Form.useForm<SearchValues>();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState<PostType[]>(initialPosts);
  const [data, setData] = useState<PostType[]>(initialPosts);
  const [filters, setFilters] = useState<SearchValues>({ deptId: '2' });

  const [deptKeyword, setDeptKeyword] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('2');

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<PostType[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加岗位');
  const [editingId, setEditingId] = useState<string | null>(null);

  const deptNameMap = useMemo(() => buildDeptNameMap(deptTreeData), []);
  const visibleDeptTree = useMemo(() => filterDeptTree(deptTreeData, deptKeyword), [deptKeyword]);
  const deptTreeAntData = useMemo(() => mapToTreeData(visibleDeptTree), [visibleDeptTree]);

  const applyData = (nextAll: PostType[], nextFilters: SearchValues) => {
    const deptId = nextFilters.deptId || undefined;
    const deptScopeIds = deptId ? collectDescendantIds(deptTreeData, deptId) : undefined;
    setAllPosts(nextAll);
    setData(filterPosts(nextAll, nextFilters, deptScopeIds));
  };

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const nextFilters: SearchValues = { ...values };
    setFilters(nextFilters);
    applyData(allPosts, nextFilters);
    message.success('搜索完成');
  };

  const handleReset = () => {
    const nextFilters: SearchValues = { deptId: selectedDeptId || undefined };
    searchForm.resetFields();
    searchForm.setFieldValue('deptId', nextFilters.deptId);
    setFilters(nextFilters);
    applyData(allPosts, nextFilters);
  };

  const openAdd = () => {
    setModalTitle('添加岗位');
    setEditingId(null);
    form.resetFields();
    form.setFieldValue('deptId', selectedDeptId || searchForm.getFieldValue('deptId'));
    form.setFieldValue('orderNum', 0);
    form.setFieldValue('status', 'active');
    setIsModalOpen(true);
  };

  const openEdit = (record: PostType) => {
    setModalTitle('修改岗位');
    setEditingId(record.id);
    form.setFieldsValue({ ...record });
    setIsModalOpen(true);
  };

  const handleDeleteRows = (ids: string[]) => {
    Modal.confirm({
      title: '确定删除所选岗位吗？',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const nextAll = allPosts.filter((p) => !ids.includes(p.id));
        applyData(nextAll, filters);
        setSelectedRowKeys([]);
        setSelectedRows([]);
        message.success('删除成功');
      },
    });
  };

  const handleExport = () => {
    const rows = data.map((r) => ({
      postCode: r.postCode || '',
      categoryCode: r.categoryCode || '',
      postName: r.postName || '',
      deptName: deptNameMap.get(r.deptId) || '',
      orderNum: String(r.orderNum ?? ''),
      status: r.status === 'active' ? '正常' : '停用',
      createTime: r.createTime || '',
      updatedTime: r.updatedTime || '',
      updatedBy: r.updatedBy || '',
    }));

    const header = ['岗位编码', '类别编码', '岗位名称', '部门', '排序', '状态', '创建时间', '最后更新时间', '最后更新人'];
    const lines = [header, ...rows.map((r) => Object.values(r))].map((cols) => cols.map(escapeCsv).join(','));
    const content = lines.join('\n');
    downloadTextFile(`岗位管理_${dayjs().format('YYYYMMDD_HHmmss')}.csv`, content);
    message.success('导出成功');
  };

  const handleRefreshCache = () => {
    setLoading(true);
    setTimeout(() => {
      applyData(allPosts, filters);
      setLoading(false);
      message.success('刷新缓存成功');
    }, 400);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      setTimeout(() => {
        const updatedTime = nowText();
        const updatedBy = '管理员';

        const nextAll = editingId
          ? allPosts.map((p) =>
              p.id === editingId
                ? {
                    ...p,
                    ...values,
                    updatedTime,
                    updatedBy,
                  }
                : p
            )
          : [
              ...allPosts,
              {
                id: getNextId(allPosts),
                postCode: values.postCode,
                categoryCode: values.categoryCode,
                postName: values.postName,
                deptId: values.deptId,
                orderNum: values.orderNum ?? 0,
                status: values.status ?? 'active',
                remark: values.remark,
                createTime: updatedTime,
                updatedTime,
                updatedBy,
              } satisfies PostType,
            ];

        applyData(nextAll, filters);
        setIsModalOpen(false);
        setLoading(false);
        message.success(editingId ? '修改成功' : '新增成功');
      }, 600);
    });
  };

  const columns: ColumnsType<PostType> = [
    {
      title: '岗位编码',
      dataIndex: 'postCode',
      key: 'postCode',
      width: 120,
    },
    {
      title: '类别编码',
      dataIndex: 'categoryCode',
      key: 'categoryCode',
      width: 140,
      render: (v) => v || '-',
    },
    {
      title: '岗位名称',
      dataIndex: 'postName',
      key: 'postName',
      width: 200,
    },
    {
      title: '部门',
      dataIndex: 'deptId',
      key: 'deptId',
      width: 220,
      render: (deptId: string) => deptNameMap.get(deptId) || '-',
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 100,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: Status) => (status === 'active' ? <Tag color="blue">正常</Tag> : <Tag color="default">停用</Tag>),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
    },
    {
      title: '最后更新时间',
      dataIndex: 'updatedTime',
      key: 'updatedTime',
      width: 200,
    },
    {
      title: '最后更新人',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      width: 140,
      render: (v) => v || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record) => (
        <Space size={6}>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="确定删除该岗位吗？" onConfirm={() => handleDeleteRows([record.id])}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const canEdit = selectedRows.length === 1;
  const canDelete = selectedRows.length > 0;

  return (
    <MainLayout title="岗位管理">
      <div className="p-4">
        <div className="flex gap-3">
          <Card bordered={false} bodyStyle={{ padding: 16 }} style={{ width: 320 }}>
            <Input
              allowClear
              value={deptKeyword}
              onChange={(e) => setDeptKeyword(e.target.value)}
              placeholder="请输入部门名称"
              prefix={<SearchOutlined />}
              style={{ marginBottom: 12 }}
            />
            <Tree
              treeData={deptTreeAntData}
              defaultExpandAll
              selectedKeys={selectedDeptId ? [selectedDeptId] : []}
              onSelect={(keys) => {
                const nextId = String(keys[0] ?? '');
                setSelectedDeptId(nextId);
                searchForm.setFieldValue('deptId', nextId || undefined);
                const nextFilters: SearchValues = { ...filters, deptId: nextId || undefined };
                setFilters(nextFilters);
                applyData(allPosts, nextFilters);
              }}
            />
          </Card>

          <div className="flex-1">
            <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
              <Form form={searchForm} layout="inline" initialValues={{ deptId: selectedDeptId }}>
                <Form.Item name="postCode" label="岗位编码">
                  <Input placeholder="请输入岗位编码" allowClear style={{ width: 220 }} />
                </Form.Item>
                <Form.Item name="categoryCode" label="类别编码">
                  <Input placeholder="请输入类别编码" allowClear style={{ width: 220 }} />
                </Form.Item>
                <Form.Item name="postName" label="岗位名称">
                  <Input placeholder="请输入岗位名称" allowClear style={{ width: 220 }} />
                </Form.Item>
                <Form.Item name="deptId" label="部门">
                  <TreeSelect
                    treeData={deptTreeData}
                    fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                    placeholder="请选择部门"
                    allowClear
                    treeDefaultExpandAll
                    style={{ width: 220 }}
                  />
                </Form.Item>
                <Form.Item name="status" label="状态">
                  <Select placeholder="岗位状态" allowClear style={{ width: 160 }}>
                    <Select.Option value="active">正常</Select.Option>
                    <Select.Option value="inactive">停用</Select.Option>
                  </Select>
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
                  <Button icon={<EditOutlined />} disabled={!canEdit} onClick={() => canEdit && openEdit(selectedRows[0])}>
                    修改
                  </Button>
                  <Button danger icon={<DeleteOutlined />} disabled={!canDelete} onClick={() => handleDeleteRows(selectedRows.map((r) => r.id))}>
                    删除
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={handleExport}>
                    导出
                  </Button>
                  <Button danger ghost icon={<ReloadOutlined />} onClick={handleRefreshCache}>
                    刷新缓存
                  </Button>
                </Space>
              </div>

              <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                size="middle"
                scroll={{ x: 1500 }}
                rowSelection={{
                  selectedRowKeys,
                  onChange: (nextSelectedRowKeys, nextSelectedRows) => {
                    setSelectedRowKeys(nextSelectedRowKeys);
                    setSelectedRows(nextSelectedRows);
                  },
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50],
                  showTotal: (total) => `共 ${total} 条`,
                }}
              />
            </Card>
          </div>
        </div>

        <Modal
          title={modalTitle}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={() => setIsModalOpen(false)}
          width={640}
          confirmLoading={loading}
          okText="确定"
          cancelText="取消"
        >
          <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            <Form.Item name="postName" label="岗位名称" rules={[{ required: true, message: '请输入岗位名称' }]}>
              <Input placeholder="请输入岗位名称" />
            </Form.Item>
            <Form.Item name="deptId" label="部门" rules={[{ required: true, message: '请选择部门' }]}>
              <TreeSelect
                treeData={deptTreeData}
                fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                placeholder="请选择部门"
                allowClear
                treeDefaultExpandAll
              />
            </Form.Item>
            <Form.Item name="postCode" label="岗位编码" rules={[{ required: true, message: '请输入岗位编码' }]}>
              <Input placeholder="请输入岗位编码" />
            </Form.Item>
            <Form.Item name="categoryCode" label="类别编码">
              <Input placeholder="请输入类别编码" />
            </Form.Item>
            <Form.Item name="orderNum" label="岗位顺序" rules={[{ required: true, message: '请输入岗位顺序' }]} initialValue={0}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="岗位状态" initialValue="active">
              <Radio.Group>
                <Radio value="active">正常</Radio>
                <Radio value="inactive">停用</Radio>
              </Radio.Group>
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
