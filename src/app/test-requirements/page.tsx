'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';
import { mockTestRequirements } from '@/mock/data';
import { TestRequirement } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

export default function TestRequirementsPage() {
  const [data, setData] = useState<TestRequirement[]>(mockTestRequirements);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TestRequirement | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: TestRequirement) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setData(data.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  const handleBatchDelete = () => {
    setData(data.filter((item) => !selectedRowKeys.includes(item.id)));
    setSelectedRowKeys([]);
    message.success('批量删除成功');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setData(
        data.map((item) =>
          item.id === editingRecord.id
            ? { ...item, ...values, updatedAt: new Date().toLocaleString() }
            : item
        )
      );
      message.success('修改成功');
    } else {
      const newId = Math.max(...data.map((d) => d.id)) + 1;
      const newRecord: TestRequirement = {
        ...values,
        id: newId,
        status: '待评审',
        createdAt: new Date().toLocaleString(),
        createdBy: '管理员',
        updatedAt: new Date().toLocaleString(),
      };
      setData([...data, newRecord]);
      message.success('新增成功');
    }
    setModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      '待评审': 'processing',
      '已通过': 'success',
      '已驳回': 'error',
      '已关闭': 'default',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      '高': 'red',
      '中': 'orange',
      '低': 'blue',
    };
    return colors[priority] || 'default';
  };

  const columns: ColumnsType<TestRequirement> = [
    { title: '需求ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '需求名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '需求类型', dataIndex: 'type', key: 'type', width: 80 },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => <Tag color={getPriorityColor(priority)}>{priority}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    { title: '所属项目', dataIndex: 'project', key: 'project', width: 100 },
    { title: '需求描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 140 },
    { title: '创建人', dataIndex: 'createdBy', key: 'createdBy', width: 100 },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 140 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <a onClick={() => handleEdit(record)}>修改</a>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <a>删除</a>
          </Popconfirm>
          <a onClick={() => message.info(`查看需求: ${record.name}`)}>查看</a>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="测试需求管理">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Input.Search
          placeholder="需求名称"
          style={{ width: 400 }}
          enterButton={<><SearchOutlined /> 查询</>}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)}
        />
        <Space wrap>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增
          </Button>
          <Popconfirm
            title="确定批量删除选中项?"
            onConfirm={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            <Button icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
              批量删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        scroll={{ x: 1300 }}
        pagination={{
          showTotal: (total) => `共${total}条`,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        style={{ background: 'white', borderRadius: 8 }}
      />

      <Modal
        title={editingRecord ? '修改测试需求' : '新增测试需求'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="需求名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="需求类型" rules={[{ required: true }]}>
            <Select options={[
              { value: '功能', label: '功能' },
              { value: '性能', label: '性能' },
              { value: '接口', label: '接口' },
              { value: '安全', label: '安全' },
            ]} />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <Select options={[
              { value: '高', label: '高' },
              { value: '中', label: '中' },
              { value: '低', label: '低' },
            ]} />
          </Form.Item>
          <Form.Item name="project" label="所属项目" rules={[{ required: true }]}>
            <Select options={[
              { value: '通用HCM', label: '通用HCM' },
              { value: '财务系统', label: '财务系统' },
              { value: '数据中台', label: '数据中台' },
            ]} />
          </Form.Item>
          <Form.Item name="description" label="需求描述" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}
