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
  UploadOutlined,
  DownloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';
import { mockTestCases } from '@/mock/data';
import { TestCase } from '@/types';
import type { ColumnsType } from 'antd/es/table';

export default function TestCasesPage() {
  const [data, setData] = useState<TestCase[]>(mockTestCases);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TestCase | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter((item) =>
      item.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: TestCase) => {
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
      const newRecord: TestCase = {
        ...values,
        id: newId,
        stepCount: 0,
        status: '有效',
        createdAt: new Date().toLocaleString(),
        createdBy: '管理员',
        updatedAt: new Date().toLocaleString(),
        updatedBy: '管理员',
      };
      setData([...data, newRecord]);
      message.success('新增成功');
    }
    setModalVisible(false);
  };

  const columns: ColumnsType<TestCase> = [
    { title: '用例ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用例描述', dataIndex: 'description', key: 'description', width: 150 },
    { title: '用例模块', dataIndex: 'module', key: 'module', width: 80 },
    { title: '测试需求', dataIndex: 'requirement', key: 'requirement', width: 80 },
    { title: '用例执行方式', dataIndex: 'executionMethod', key: 'executionMethod', width: 100 },
    { title: '步骤信息', dataIndex: 'stepCount', key: 'stepCount', width: 80 },
    { title: '所属项目', dataIndex: 'project', key: 'project', width: 100 },
    {
      title: '数据状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === '有效' ? 'success' : status === '草稿' ? 'default' : 'error'}>
          {status}
        </Tag>
      ),
    },
    { title: '测试环境', dataIndex: 'environment', key: 'environment', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 140 },
    { title: '创建人', dataIndex: 'createdBy', key: 'createdBy', width: 80 },
    { title: '修改人', dataIndex: 'updatedBy', key: 'updatedBy', width: 80 },
    { title: '修改时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 140 },
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
          <a onClick={() => message.info(`查看用例: ${record.description}`)}>查看</a>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="测试用例管理">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Input.Search
          placeholder="用例描述"
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
          <Button icon={<UploadOutlined />} onClick={() => message.info('导入功能开发中')}>
            导入
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => message.info('导出功能开发中')}>
            导出
          </Button>
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
        scroll={{ x: 1500 }}
        pagination={{
          showTotal: (total) => `共${total}条`,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        style={{ background: 'white', borderRadius: 8 }}
      />

      <Modal
        title={editingRecord ? '修改测试用例' : '新增测试用例'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="description" label="用例描述" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="module" label="用例模块" rules={[{ required: true }]}>
            <Select options={[
              { value: '组织', label: '组织' },
              { value: '薪酬', label: '薪酬' },
              { value: '人事', label: '人事' },
              { value: '权限', label: '权限' },
              { value: '考勤', label: '考勤' },
              { value: '流程', label: '流程' },
              { value: '报表', label: '报表' },
              { value: '接口', label: '接口' },
            ]} />
          </Form.Item>
          <Form.Item name="requirement" label="测试需求" rules={[{ required: true }]}>
            <Select options={[
              { value: '功能', label: '功能' },
              { value: '性能', label: '性能' },
              { value: '接口', label: '接口' },
              { value: '安全', label: '安全' },
            ]} />
          </Form.Item>
          <Form.Item name="executionMethod" label="执行方式" rules={[{ required: true }]}>
            <Select options={[
              { value: '自动', label: '自动' },
              { value: '手动', label: '手动' },
              { value: '混合', label: '混合' },
            ]} />
          </Form.Item>
          <Form.Item name="project" label="所属项目" rules={[{ required: true }]}>
            <Select options={[
              { value: '通用HCM', label: '通用HCM' },
              { value: '财务系统', label: '财务系统' },
              { value: '数据中台', label: '数据中台' },
            ]} />
          </Form.Item>
          <Form.Item name="environment" label="测试环境" rules={[{ required: true }]}>
            <Select options={[
              { value: '开发环境', label: '开发环境' },
              { value: '测试环境', label: '测试环境' },
              { value: '预发环境', label: '预发环境' },
              { value: '生产环境', label: '生产环境' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}
