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
  DatePicker,
  Progress,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';
import { mockTestPlans } from '@/mock/data';
import { TestPlan } from '@/types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function TestPlansPage() {
  const [data, setData] = useState<TestPlan[]>(mockTestPlans);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TestPlan | null>(null);
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

  const handleEdit = (record: TestPlan) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    });
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
    const { dateRange, ...rest } = values;
    const planData = {
      ...rest,
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
    };

    if (editingRecord) {
      setData(
        data.map((item) =>
          item.id === editingRecord.id ? { ...item, ...planData } : item
        )
      );
      message.success('修改成功');
    } else {
      const newId = Math.max(...data.map((d) => d.id)) + 1;
      const newRecord: TestPlan = {
        ...planData,
        id: newId,
        progress: 0,
        caseCount: 0,
        createdAt: new Date().toLocaleString(),
      };
      setData([...data, newRecord]);
      message.success('新增成功');
    }
    setModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      '未开始': 'default',
      '进行中': 'processing',
      '已完成': 'success',
      '已暂停': 'warning',
    };
    return colors[status] || 'default';
  };

  const columns: ColumnsType<TestPlan> = [
    { title: '计划ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '计划名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '版本', dataIndex: 'version', key: 'version', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    { title: '用例数', dataIndex: 'caseCount', key: 'caseCount', width: 80 },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 110 },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 110 },
    { title: '负责人', dataIndex: 'owner', key: 'owner', width: 100 },
    { title: '所属项目', dataIndex: 'project', key: 'project', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 140 },
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
          <a onClick={() => message.info(`查看计划: ${record.name}`)}>查看</a>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="测试计划管理">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Input.Search
          placeholder="计划名称"
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
        scroll={{ x: 1400 }}
        pagination={{
          showTotal: (total) => `共${total}条`,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        style={{ background: 'white', borderRadius: 8 }}
      />

      <Modal
        title={editingRecord ? '修改测试计划' : '新增测试计划'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="计划名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="version" label="版本" rules={[{ required: true }]}>
            <Input placeholder="如: V1.0, V2.0" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={[
              { value: '未开始', label: '未开始' },
              { value: '进行中', label: '进行中' },
              { value: '已完成', label: '已完成' },
              { value: '已暂停', label: '已暂停' },
            ]} />
          </Form.Item>
          <Form.Item name="dateRange" label="计划周期" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="owner" label="负责人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="project" label="所属项目" rules={[{ required: true }]}>
            <Select options={[
              { value: '通用HCM', label: '通用HCM' },
              { value: '财务系统', label: '财务系统' },
              { value: '数据中台', label: '数据中台' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}
