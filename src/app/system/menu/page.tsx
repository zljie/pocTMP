'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  Radio,
  InputNumber,
  TreeSelect,
  Popconfirm,
  message,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// 菜单类型定义
interface MenuType {
  id: string;
  key: string;
  name: string;
  icon: string;
  order: number;
  permission: string;
  path: string;
  component: string;
  type: 'dir' | 'menu' | 'button';
  status: 'active' | 'inactive';
  createTime: string;
  children?: MenuType[];
  parentId?: string;
  visible?: boolean;
  isLink?: boolean;
}

// 模拟数据
const initialData: MenuType[] = [
  {
    id: '1',
    key: '1',
    name: '系统管理',
    icon: 'setting',
    order: 1,
    permission: '',
    path: '/system',
    component: 'Layout',
    type: 'dir',
    status: 'active',
    createTime: '2025-08-18 09:57:50',
    children: [
      {
        id: '2',
        key: '2',
        name: '用户管理',
        icon: 'user',
        order: 1,
        permission: 'system:user:list',
        path: 'user',
        component: 'system/user/index',
        type: 'menu',
        status: 'active',
        createTime: '2025-08-18 09:57:50',
        parentId: '1',
      },
      {
        id: '3',
        key: '3',
        name: '角色管理',
        icon: 'team',
        order: 2,
        permission: 'system:role:list',
        path: 'role',
        component: 'system/role/index',
        type: 'menu',
        status: 'active',
        createTime: '2025-08-18 09:57:50',
        parentId: '1',
      },
      {
        id: '4',
        key: '4',
        name: '菜单管理',
        icon: 'unordered-list',
        order: 3,
        permission: 'system:menu:list',
        path: 'menu',
        component: 'system/menu/index',
        type: 'menu',
        status: 'active',
        createTime: '2025-08-18 09:57:50',
        parentId: '1',
      },
    ],
  },
  {
    id: '5',
    key: '5',
    name: '测试用例管理',
    icon: 'file-text',
    order: 2,
    permission: '',
    path: '/test-cases',
    component: 'Layout',
    type: 'dir',
    status: 'active',
    createTime: '2025-08-18 09:57:50',
  },
];

export default function MenuPage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MenuType[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增菜单');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 搜索处理
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    // 这里简单实现前端搜索，实际应调用API
    console.log('Search values:', values);
    message.success('搜索功能（模拟）');
  };

  const handleReset = () => {
    searchForm.resetFields();
    setData(initialData);
  };

  // 新增/编辑处理
  const handleAdd = (parentId?: string) => {
    setModalTitle('新增菜单');
    setEditingId(null);
    form.resetFields();
    if (parentId) {
      form.setFieldValue('parentId', parentId);
    }
    setIsModalOpen(true);
  };

  const handleEdit = (record: MenuType) => {
    setModalTitle('修改菜单');
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      parentId: record.parentId || undefined,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // 递归删除逻辑略复杂，这里仅演示删除顶层或叶子节点
    // 实际项目中应调用后端API
    message.success('删除成功（模拟）');
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log('Form values:', values);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsModalOpen(false);
        message.success(`${modalTitle}成功（模拟）`);
      }, 500);
    });
  };

  const columns: ColumnsType<MenuType> = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      align: 'center',
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      align: 'center',
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      key: 'permission',
      width: 150,
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      key: 'component',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'blue' : 'error'}>
          {status === 'active' ? '正常' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => handleAdd(record.id)}
          />
          <Popconfirm
            title="确定删除该菜单吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card bordered={false} className="mb-4">
        <Form form={searchForm} layout="inline">
          <Form.Item name="name" label="菜单名称">
            <Input placeholder="请输入菜单名称" allowClear />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="菜单状态" allowClear style={{ width: 120 }}>
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

      <Card bordered={false}>
        <div className="mb-4">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
              新增
            </Button>
            <Button danger icon={<DeleteOutlined />}>
              级联删除
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item name="parentId" label="上级菜单">
            <TreeSelect
              treeData={data}
              fieldNames={{ label: 'name', value: 'id', children: 'children' }}
              placeholder="选择上级菜单"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>

          <Form.Item name="type" label="菜单类型" initialValue="menu">
            <Radio.Group>
              <Radio value="dir">目录</Radio>
              <Radio value="menu">菜单</Radio>
              <Radio value="button">按钮</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="icon" label="菜单图标">
            <Input placeholder="点击选择图标" />
          </Form.Item>

          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>

          <Form.Item name="order" label="显示排序" initialValue={1}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isLink" label="是否外链" initialValue={false}>
            <Radio.Group>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="path" label="路由地址">
            <Input placeholder="请输入路由地址" />
          </Form.Item>
          
          <Form.Item name="component" label="组件路径">
             <Input placeholder="请输入组件路径" />
          </Form.Item>

          <Form.Item name="permission" label="权限标识">
            <Input placeholder="请输入权限标识" />
          </Form.Item>

          <Form.Item name="visible" label="显示状态" initialValue={true}>
            <Radio.Group>
              <Radio value={true}>显示</Radio>
              <Radio value={false}>隐藏</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="status" label="菜单状态" initialValue="active">
            <Radio.Group>
              <Radio value="active">正常</Radio>
              <Radio value="inactive">停用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
