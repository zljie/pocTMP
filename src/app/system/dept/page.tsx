'use client';

import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  Card,
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
  TreeSelect,
  message,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '@/components/layout/MainLayout';

interface ProductType {
  id: string;
  name: string;
  code?: string;
  orderNum: number;
  status: 'active' | 'inactive';
  createTime: string;
  updatedTime: string;
  updatedBy: string;
  parentId?: string;
  leader?: string;
  phone?: string;
  email?: string;
  children?: ProductType[];
}

const initialData: ProductType[] = [
  {
    id: '1',
    name: '昆仓数智',
    code: '',
    orderNum: 0,
    status: 'active',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
    children: [
      {
        id: '2',
        parentId: '1',
        name: '昆仓ERP3.0产品',
        code: '',
        orderNum: 1,
        status: 'active',
        createTime: '2025-08-18 09:57:50',
        updatedTime: '2025-08-18 09:57:50',
        updatedBy: '管理员',
      },
    ],
  },
];

type SearchValues = {
  name?: string;
  code?: string;
  status?: ProductType['status'];
};

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const normalizeText = (v?: string) => (v ?? '').trim().toLowerCase();

const getAllIds = (items: ProductType[]) => {
  const ids: string[] = [];
  const walk = (list: ProductType[]) => {
    list.forEach((item) => {
      ids.push(item.id);
      if (item.children?.length) walk(item.children);
    });
  };
  walk(items);
  return ids;
};

const filterTree = (items: ProductType[], filters: SearchValues): ProductType[] => {
  const name = normalizeText(filters.name);
  const code = normalizeText(filters.code);
  const status = filters.status;

  const matches = (node: ProductType) => {
    const okName = !name || normalizeText(node.name).includes(name);
    const okCode = !code || normalizeText(node.code).includes(code);
    const okStatus = !status || node.status === status;
    return okName && okCode && okStatus;
  };

  const walk = (list: ProductType[]): ProductType[] => {
    const next: ProductType[] = [];
    list.forEach((node) => {
      const nextChildren = node.children?.length ? walk(node.children) : undefined;
      const hit = matches(node);
      if (hit || (nextChildren && nextChildren.length)) {
        next.push({ ...node, children: nextChildren });
      }
    });
    return next;
  };

  return walk(items);
};

const updateNodeById = (items: ProductType[], id: string, updater: (node: ProductType) => ProductType): ProductType[] => {
  return items.map((item) => {
    if (item.id === id) return updater(item);
    if (item.children?.length) return { ...item, children: updateNodeById(item.children, id, updater) };
    return item;
  });
};

const addNode = (items: ProductType[], node: ProductType, parentId?: string): ProductType[] => {
  if (!parentId) return [...items, node];
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...(item.children || []), node] };
    }
    if (item.children?.length) return { ...item, children: addNode(item.children, node, parentId) };
    return item;
  });
};

const removeNodeById = (items: ProductType[], id: string): ProductType[] => {
  const next = items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (!item.children?.length) return item;
      return { ...item, children: removeNodeById(item.children, id) };
    });
  return next;
};

export default function ProductPage() {
  const [searchForm] = Form.useForm<SearchValues>();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<ProductType[]>(initialData);
  const [data, setData] = useState<ProductType[]>(initialData);
  const [filters, setFilters] = useState<SearchValues>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>(getAllIds(initialData));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增产品');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setFilters(values);
    setData(filterTree(allData, values));
    message.success('搜索完成');
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilters({});
    setData(allData);
    setExpandedRowKeys(getAllIds(allData));
  };

  const handleToggleExpand = () => {
    const ids = getAllIds(data);
    if (!ids.length) return;
    setExpandedRowKeys((prev) => (prev.length ? [] : ids));
  };

  const getNextId = (items: ProductType[]) => {
    let maxId = 0;
    const walk = (list: ProductType[]) => {
      list.forEach((item) => {
        maxId = Math.max(maxId, Number(item.id) || 0);
        if (item.children?.length) walk(item.children);
      });
    };
    walk(items);
    return String(maxId + 1);
  };

  const openAdd = (parentId?: string) => {
    setModalTitle('新增产品');
    setEditingId(null);
    form.resetFields();
    if (parentId) form.setFieldValue('parentId', parentId);
    form.setFieldValue('orderNum', 0);
    form.setFieldValue('status', 'active');
    setIsModalOpen(true);
  };

  const openEdit = (record: ProductType) => {
    setModalTitle('修改产品');
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      parentId: record.parentId || undefined,
    });
    setIsModalOpen(true);
  };

  const applyAllData = (nextAll: ProductType[]) => {
    setAllData(nextAll);
    setData(filterTree(nextAll, filters));
    const visibleIds = getAllIds(filterTree(nextAll, filters));
    setExpandedRowKeys((prev) => prev.filter((k) => visibleIds.includes(String(k))));
  };

  const handleDelete = (record: ProductType) => {
    Modal.confirm({
      title: '确定删除该产品及其子节点吗？',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const nextAll = removeNodeById(allData, record.id);
        applyAllData(nextAll);
        message.success('删除成功');
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      setTimeout(() => {
        const updatedTime = nowText();
        const updatedBy = '管理员';
        const parentId: string | undefined = values.parentId || undefined;
        const nextAll = editingId
          ? updateNodeById(allData, editingId, (node) => ({
              ...node,
              ...values,
              parentId,
              updatedTime,
              updatedBy,
            }))
          : addNode(
              allData,
              {
                id: getNextId(allData),
                name: values.name,
                code: values.code,
                orderNum: values.orderNum ?? 0,
                status: values.status ?? 'active',
                createTime: updatedTime,
                updatedTime,
                updatedBy,
                parentId,
                leader: values.leader,
                phone: values.phone,
                email: values.email,
              },
              parentId
            );

        applyAllData(nextAll);
        setIsModalOpen(false);
        setLoading(false);
        message.success(editingId ? '修改成功' : '新增成功');
      }, 600);
    });
  };

  const leaderOptions = useMemo(
    () => [
      { value: '管理员', label: '管理员' },
      { value: '张三', label: '张三' },
      { value: '李四', label: '李四' },
    ],
    []
  );

  const columns: ColumnsType<ProductType> = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 260,
    },
    {
      title: '类别编码',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (v) => v || '-',
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ProductType['status']) =>
        status === 'active' ? <Tag color="blue">正常</Tag> : <Tag color="default">停用</Tag>,
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
      width: 160,
      render: (_: unknown, record) => (
        <Space size={6}>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button type="link" icon={<PlusOutlined />} onClick={() => openAdd(record.id)} />
          <Popconfirm title="确定删除该产品吗？" onConfirm={() => handleDelete(record)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="产品管理">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="name" label="产品名称">
              <Input placeholder="请输入产品名称" allowClear style={{ width: 240 }} />
            </Form.Item>
            <Form.Item name="code" label="类别编码">
              <Input placeholder="请输入类别编码" allowClear style={{ width: 240 }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="产品状态" allowClear style={{ width: 160 }}>
                <Select.Option value="active">正常</Select.Option>
                <Select.Option value="inactive">停用</Select.Option>
              </Select>
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
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openAdd()}>
                新增
              </Button>
              <Button onClick={handleToggleExpand}>展开/折叠</Button>
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
            pagination={false}
            loading={loading}
            size="middle"
            expandable={{
              expandedRowKeys,
              onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
            }}
          />
        </Card>

        <Modal
          title={modalTitle}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={() => setIsModalOpen(false)}
          width={720}
          confirmLoading={loading}
          okText="确定"
          cancelText="取消"
        >
          <Form form={form} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            <Form.Item name="parentId" label="上级产品">
              <TreeSelect
                treeData={allData}
                fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                placeholder="选择上级产品"
                allowClear
                treeDefaultExpandAll
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="name" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
                <Input placeholder="请输入产品名称" />
              </Form.Item>
              <Form.Item name="code" label="类别编码">
                <Input placeholder="请输入类别编码" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="orderNum" label="显示排序" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="leader" label="负责人">
                <Select placeholder="请选择负责人" allowClear options={leaderOptions} />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="phone" label="联系电话">
                <Input placeholder="请输入联系电话" />
              </Form.Item>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </div>

            <Form.Item name="status" label="产品状态" initialValue="active">
              <Radio.Group>
                <Radio value="active">正常</Radio>
                <Radio value="inactive">停用</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}
