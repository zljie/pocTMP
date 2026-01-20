'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '@/components/layout/MainLayout';

// 测试报告类型定义
interface TestReportType {
  id: string;
  testSetId: string;
  testSetName: string; // 所属测试集
  sceneCount: number; // 测试场景数
  successCount: number; // 成功数
  failureCount: number; // 失败数
  exceptionCount: number; // 异常数
  skipCount: number; // 跳过数
  progress: 'Completed' | 'Running' | 'Pending'; // 测试进度
  startTime: string; // 测试开始时间
  endTime: string; // 测试完成时间
  tester: string; // 测试人员
  projectName: string; // 所属项目
  remark: string; // 备注
}

// 报告详情类型定义
interface ReportDetailType {
  id: string;
  reportId: string;
  name: string; // 接口/组合场景
  statusCode: string; // 状态码 (screenshot shows "false", maybe boolean or string)
  duration: number; // 耗时
  testTime: string; // 测试时间
  remark: string; // 备注
  result: 'Success' | 'Failure' | 'Exception' | 'Skip'; // 结果
}

// 模拟测试报告数据
const initialReports: TestReportType[] = [
  {
    id: '214',
    testSetId: 'ts1',
    testSetName: '权限接口测试',
    sceneCount: 20,
    successCount: 0,
    failureCount: 0,
    exceptionCount: 20,
    skipCount: 0,
    progress: 'Completed',
    startTime: '2023-03-10 13:44:13',
    endTime: '2023-03-10 13:45:54',
    tester: '刘测试',
    projectName: '基础资料平台(mdm)',
    remark: '',
  },
  {
    id: '213',
    testSetId: 'ts1',
    testSetName: '权限接口测试',
    sceneCount: 20,
    successCount: 0,
    failureCount: 0,
    exceptionCount: 20,
    skipCount: 0,
    progress: 'Completed',
    startTime: '2023-03-10 13:42:47',
    endTime: '2023-03-10 13:44:28',
    tester: '刘测试',
    projectName: '基础资料平台(mdm)',
    remark: '',
  },
  {
    id: '212',
    testSetId: 'ts1',
    testSetName: '权限接口测试',
    sceneCount: 20,
    successCount: 0,
    failureCount: 0,
    exceptionCount: 20,
    skipCount: 0,
    progress: 'Completed',
    startTime: '2023-03-10 13:39:57',
    endTime: '2023-03-10 13:41:40',
    tester: '刘测试',
    projectName: '基础资料平台(mdm)',
    remark: '',
  },
  {
    id: '211',
    testSetId: 'ts2',
    testSetName: 'ceshi0006',
    sceneCount: 3,
    successCount: 0,
    failureCount: 0,
    exceptionCount: 3,
    skipCount: 0,
    progress: 'Completed',
    startTime: '2023-03-09 16:23:33',
    endTime: '2023-03-09 16:23:43',
    tester: '张开发',
    projectName: '基础资料平台(mdm)',
    remark: '',
  },
  {
    id: '205',
    testSetId: 'ts3',
    testSetName: '测试新增修改',
    sceneCount: 1,
    successCount: 0,
    failureCount: 1,
    exceptionCount: 0,
    skipCount: 0,
    progress: 'Completed',
    startTime: '2023-03-09 15:59:22',
    endTime: '2023-03-09 15:59:28',
    tester: '王产品',
    projectName: '电商前台项目',
    remark: '',
  },
  {
    id: '203',
    testSetId: 'ts3',
    testSetName: '测试新增修改',
    sceneCount: 2,
    successCount: 0,
    failureCount: 0,
    exceptionCount: 2,
    skipCount: 0,
    progress: 'Completed',
    startTime: '2023-03-09 15:55:43',
    endTime: '2023-03-09 15:55:44',
    tester: '王产品',
    projectName: '电商前台项目',
    remark: '',
  },
  {
    id: '202',
    testSetId: 'ts1',
    testSetName: '权限接口测试',
    sceneCount: 20,
    successCount: 0,
    failureCount: 0,
    exceptionCount: 20,
    skipCount: 0,
    progress: 'Completed',
    startTime: '2023-03-07 10:34:07',
    endTime: '2023-03-07 10:35:49',
    tester: '刘测试',
    projectName: '基础资料平台(mdm)',
    remark: '',
  },
];

// 模拟详情数据
const initialDetails: ReportDetailType[] = [
  {
    id: '1',
    reportId: '214',
    name: 'testlogin_测试登录_正常场景',
    statusCode: 'false',
    duration: 0,
    testTime: '2023-02-24 10:39:54',
    remark: '发送请求出错...',
    result: 'Exception',
  },
  {
    id: '2',
    reportId: '214',
    name: 'test_create_创建_正常场景',
    statusCode: 'false',
    duration: 0,
    testTime: '2023-02-24 10:39:54',
    remark: '发送请求出错...',
    result: 'Exception',
  },
  {
    id: '3',
    reportId: '214',
    name: 'test_create_创建_正常场景',
    statusCode: 'false',
    duration: 0,
    testTime: '2023-02-24 10:39:54',
    remark: '组合场景名[测试]...',
    result: 'Exception',
  },
  {
    id: '4',
    reportId: '214',
    name: 'test_login_登录_正常场景',
    statusCode: 'false',
    duration: 0,
    testTime: '2023-02-24 10:39:55',
    remark: '组合场景名[测试]...',
    result: 'Exception',
  },
];

export default function TestReportManagementPage() {
  const [searchForm] = Form.useForm();
  
  const [data, setData] = useState<TestReportType[]>(initialReports);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 详情弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState<TestReportType | null>(null);
  const [currentDetails, setCurrentDetails] = useState<ReportDetailType[]>([]);

  // 搜索处理
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const testSetName = values.testSetName?.toLowerCase();
    
    if (!testSetName) {
      setData(initialReports);
      message.success('查询成功');
      return;
    }

    const filtered = initialReports.filter(item => 
      item.testSetName.toLowerCase().includes(testSetName)
    );
    setData(filtered);
    message.success('查询成功');
  };

  // 删除处理
  const handleDelete = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
    message.success('删除成功');
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    Modal.confirm({
      title: '提示',
      content: `确定对[id=${selectedRowKeys.join(',')}]进行[批量删除]操作?`,
      onOk: () => {
        setData(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      },
    });
  };

  // 打开详情
  const openDetailModal = (record: TestReportType) => {
    setCurrentReport(record);
    // 这里简单使用模拟数据，实际应根据reportId筛选
    // 为了演示效果，我们总是显示 initialDetails
    setCurrentDetails(initialDetails); 
    setDetailModalVisible(true);
  };

  // 详情列定义
  const detailColumns: ColumnsType<ReportDetailType> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '接口/组合场景',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 80,
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
    },
    {
      title: '测试时间',
      dataIndex: 'testTime',
      key: 'testTime',
      width: 160,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result) => {
        let color = 'default';
        let text = result;
        if (result === 'Success') { color = 'green'; text = '成功'; }
        if (result === 'Failure') { color = 'red'; text = '失败'; }
        if (result === 'Exception') { color = 'orange'; text = '异常结束'; }
        if (result === 'Skip') { color = 'gold'; text = '跳过'; }
        return <Tag color={color} bordered={true} style={{ background: '#fff' }}>{text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: () => (
        <Button type="link" size="small" style={{ padding: 0 }}>
          删除
        </Button>
      ),
    },
  ];

  // 主表格列定义
  const columns: ColumnsType<TestReportType> = [
    {
      title: '报告ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => Number(a.id) - Number(b.id),
    },
    {
      title: '所属测试集',
      dataIndex: 'testSetName',
      key: 'testSetName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '测试场景数',
      dataIndex: 'sceneCount',
      key: 'sceneCount',
      width: 100,
      align: 'center',
      render: (count, record) => (
        <Tag color="blue" style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }} onClick={() => openDetailModal(record)}>
          {count}
        </Tag>
      ),
    },
    {
      title: '成功数',
      dataIndex: 'successCount',
      key: 'successCount',
      width: 80,
      align: 'center',
      render: (count, record) => (
        <Tag color="green" style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }} onClick={() => openDetailModal(record)}>
          {count}
        </Tag>
      ),
    },
    {
      title: '失败数',
      dataIndex: 'failureCount',
      key: 'failureCount',
      width: 80,
      align: 'center',
      render: (count, record) => (
        <Tag color="red" style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }} onClick={() => openDetailModal(record)}>
          {count}
        </Tag>
      ),
    },
    {
      title: '异常数',
      dataIndex: 'exceptionCount',
      key: 'exceptionCount',
      width: 80,
      align: 'center',
      render: (count, record) => (
        <Tag color="orange" style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }} onClick={() => openDetailModal(record)}>
          {count}
        </Tag>
      ),
    },
    {
      title: '跳过数',
      dataIndex: 'skipCount',
      key: 'skipCount',
      width: 80,
      align: 'center',
      render: (count, record) => (
        <Tag color="gold" style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }} onClick={() => openDetailModal(record)}>
          {count}
        </Tag>
      ),
    },
    {
      title: '测试进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 100,
      align: 'center',
      render: (progress) => {
         const map: Record<string, string> = {
           Completed: '已完成',
           Running: '执行中',
           Pending: '等待中'
         };
         return <Tag color="blue">{map[progress] || progress}</Tag>;
      },
    },
    {
      title: '测试开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
    },
    {
      title: '测试完成时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
    },
    {
      title: '测试人员',
      dataIndex: 'tester',
      key: 'tester',
      width: 100,
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="确定删除该报告吗？"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" size="small" style={{ padding: 0 }}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <MainLayout title="测试报告管理">
      <div className="p-4">
        {/* 搜索区域 */}
        <Card bordered={false} style={{ marginBottom: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="testSetName" label="所属测试集" style={{ marginRight: 10 }}>
              <Input placeholder="请输入测试集名称" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button danger onClick={handleBatchDelete}>
                  批量删除
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* 表格区域 */}
        <Card bordered={false} styles={{ body: { padding: '16px 24px 24px' } }}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              total: data.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            scroll={{ x: 1800 }}
            size="middle"
          />
        </Card>

        {/* 详情弹窗 */}
        <Modal
          title={`${currentReport?.testSetName || ''}的测试报告`}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={1000}
        >
          <Table
            columns={detailColumns}
            dataSource={currentDetails}
            rowKey="id"
            pagination={{
              defaultPageSize: 10,
              showTotal: (total) => `共 ${total} 条`,
            }}
            size="middle"
          />
        </Modal>
      </div>
    </MainLayout>
  );
}
