'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Tag, Button, Tabs, List, Typography, Space, Radio, Badge } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined, CheckCircleOutlined, FileTextOutlined, RiseOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });
const { Title, Text, Paragraph } = Typography;

interface TestReportDetailProps {
  reportId: string;
}

export const TestReportDetail: React.FC<TestReportDetailProps> = ({ reportId }) => {
  const router = useRouter();
  const [historyRange, setHistoryRange] = useState('30');

  // 模拟报告元数据
  const reportInfo = {
    title: `供应商管理模块测试报告 (ID: ${reportId})`,
    system: '采购系统',
    module: '供应商管理',
    executionTime: '2024-12-15 08:00',
    stats: {
      total: 12,
      passed: 10,
      failed: 2,
      passRate: 83.3,
    },
  };

  // 概览 - 执行状态分布 (饼图)
  const overviewStatusOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        name: '执行状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' },
        },
        labelLine: { show: false },
        data: [
          { value: 10, name: '通过', itemStyle: { color: '#52c41a' } },
          { value: 2, name: '失败', itemStyle: { color: '#ff4d4f' } },
        ],
      },
    ],
  };

  // 概览 - 缺陷统计
  const defects = [
    {
      id: 1,
      title: '文件上传大小限制不明确',
      desc: '上传文件超过5MB时没有明确提示',
      severity: '中',
      severityColor: 'green', // screenshot shows green for "中" (Medium) which is unusual but I'll follow typical conventions or screenshot. Screenshot shows "中" with green bg.
      status: '开放',
      statusColor: 'red',
    },
    {
      id: 2,
      title: '审核状态显示延迟',
      desc: '审核状态更新存在1-2分钟延迟',
      severity: '低',
      severityColor: 'blue',
      status: '处理中',
      statusColor: 'green', // screenshot shows green for "处理中" (Processing) usually blue/gold but screenshot shows green text bg.
    },
  ];

  // 历史分析 - 趋势图
  const historyTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['通过率', '总用例数'], right: 10 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: 15 }, (_, i) => `12-${i + 1}`),
    },
    yAxis: [
      { type: 'value', name: '通过率(%)', min: 0, max: 100, position: 'left' },
      { type: 'value', name: '用例数', min: 0, max: 40, position: 'right' },
    ],
    series: [
      {
        name: '通过率',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        data: [82, 82, 78, 76, 70, 82, 82, 90, 65, 82, 90, 85, 80, 83, 83],
        itemStyle: { color: '#722ed1' },
        areaStyle: { color: 'rgba(114, 46, 209, 0.1)' },
      },
      {
        name: '总用例数',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: [25, 20, 10, 18, 12, 14, 13, 12, 25, 18, 20, 10, 12, 18, 20],
        itemStyle: { color: '#52c41a' },
      },
    ],
  };

  // 问题模式 - 高频问题类型 (柱状图)
  const problemTypeOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['文件上传', '权限验证', '数据验证', 'UI响应', 'API接口'],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '问题数量',
        type: 'bar',
        barWidth: '60%',
        data: [
          { value: 15, itemStyle: { color: '#1890ff' } },
          { value: 12, itemStyle: { color: '#13c2c2' } },
          { value: 10, itemStyle: { color: '#faad14' } },
          { value: 8, itemStyle: { color: '#ff7a45' } },
          { value: 6, itemStyle: { color: '#722ed1' } },
        ],
      },
    ],
  };

  // 问题模式 - 趋势分析列表
  const problemTrends = [
    { type: '文件上传', count: 15, trend: 'up' },
    { type: '权限验证', count: 12, trend: 'down' },
    { type: '数据验证', count: 10, trend: 'up' },
    { type: 'UI响应', count: 8, trend: 'down' },
    { type: 'API接口', count: 6, trend: 'flat' },
  ];

  const items = [
    {
      key: 'overview',
      label: (
        <span>
          <CheckCircleOutlined /> 概览
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="执行状态分布" bordered={false} className="h-full">
              <ReactECharts option={overviewStatusOption} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="缺陷统计" bordered={false} className="h-full">
              <List
                itemLayout="horizontal"
                dataSource={defects}
                renderItem={(item) => (
                  <List.Item>
                    <Card style={{ width: '100%' }} size="small">
                      <div className="flex justify-between items-start mb-2">
                        <Space>
                          <Tag color={item.severityColor}>{item.severity}</Tag>
                          <Tag color={item.statusColor}>{item.status}</Tag>
                          <Text strong style={{ fontSize: 16 }}>
                            {item.title}
                          </Text>
                        </Space>
                      </div>
                      <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        {item.desc}
                      </Paragraph>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'history',
      label: (
        <span>
          <RiseOutlined /> 历史分析
        </span>
      ),
      children: (
        <Card bordered={false}>
          <div className="flex justify-between items-center mb-4">
            <Title level={4} style={{ margin: 0 }}>
              历史执行趋势
            </Title>
            <Radio.Group value={historyRange} onChange={(e) => setHistoryRange(e.target.value)}>
              <Radio.Button value="7">7天</Radio.Button>
              <Radio.Button value="30">30天</Radio.Button>
              <Radio.Button value="90">90天</Radio.Button>
            </Radio.Group>
          </div>
          <ReactECharts option={historyTrendOption} style={{ height: 400 }} />
        </Card>
      ),
    },
    {
      key: 'problems',
      label: (
        <span>
          <FileTextOutlined /> 问题模式
        </span>
      ),
      children: (
        <>
          <div
            style={{
              background: '#e6f7ff',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '24px',
              border: '1px solid #91d5ff',
            }}
          >
            <Title level={5} style={{ color: '#0050b3', margin: 0 }}>
              问题模式分析
            </Title>
            <Text type="secondary">识别反复出现问题的测试用例和高频失败的功能模块</Text>
          </div>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="高频问题类型" bordered={false}>
                <ReactECharts option={problemTypeOption} style={{ height: 300 }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="问题趋势分析" bordered={false}>
                <List
                  dataSource={problemTrends}
                  renderItem={(item) => (
                    <List.Item>
                      <div className="flex justify-between w-full items-center p-2 hover:bg-gray-50 rounded">
                        <Space>
                          <Badge color={item.type === '文件上传' ? 'blue' : item.type === '权限验证' ? 'cyan' : item.type === '数据验证' ? 'gold' : 'purple'} />
                          <Text strong>{item.type}</Text>
                        </Space>
                        <Space>
                          <Text type="secondary">出现 {item.count} 次</Text>
                          {item.trend === 'up' && <RiseOutlined style={{ color: 'red' }} />}
                          {item.trend === 'down' && <RiseOutlined style={{ color: 'green', transform: 'scaleY(-1)' }} />}
                        </Space>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'suggestions',
      label: (
        <span>
          <CheckCircleOutlined /> 改进建议
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title={<Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> 质量改进建议</Space>} bordered={false}>
              <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                <Title level={5} style={{ color: '#389e0d', marginTop: 0 }}>优化建议</Title>
                <ul style={{ paddingLeft: 20, color: '#389e0d' }}>
                  <li>加强文件上传功能的测试覆盖</li>
                  <li style={{ marginTop: 8 }}>完善权限验证机制</li>
                  <li style={{ marginTop: 8 }}>优化API接口响应时间</li>
                </ul>
              </div>
              <div style={{ background: '#e6f7ff', padding: '16px', borderRadius: '8px', border: '1px solid #91d5ff', marginTop: 16 }}>
                <Title level={5} style={{ color: '#096dd9', marginTop: 0 }}>风险预警</Title>
                <ul style={{ paddingLeft: 20, color: '#096dd9' }}>
                  <li>高并发场景下的性能问题</li>
                  <li style={{ marginTop: 8 }}>数据一致性需要加强验证</li>
                  <li style={{ marginTop: 8 }}>异常处理机制待完善</li>
                </ul>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title={<Space><Tag color="purple">◎</Tag> 目标设定</Space>} bordered={false}>
              <List itemLayout="horizontal">
                <List.Item>
                   <div className="w-full">
                     <div className="flex justify-between">
                       <Text strong>下个版本通过率目标</Text>
                       <Title level={4} style={{ margin: 0, color: '#722ed1' }}>≥95%</Title>
                     </div>
                     <Text type="secondary">当前: 83.3%</Text>
                     <Text type="secondary" style={{ float: 'right' }}>目标</Text>
                   </div>
                </List.Item>
                <List.Item>
                   <div className="w-full">
                     <div className="flex justify-between">
                       <Text strong>缺陷收敛时间</Text>
                       <Title level={4} style={{ margin: 0, color: '#1890ff' }}>7天</Title>
                     </div>
                     <Text type="secondary">预计修复时间</Text>
                     <Text type="secondary" style={{ float: 'right' }}>内解决</Text>
                   </div>
                </List.Item>
                <List.Item>
                   <div className="w-full">
                     <div className="flex justify-between">
                       <Text strong>测试覆盖度</Text>
                       <Title level={4} style={{ margin: 0, color: '#52c41a' }}>85%</Title>
                     </div>
                     <Text type="secondary">当前覆盖水平</Text>
                     <Text type="secondary" style={{ float: 'right' }}>覆盖率</Text>
                   </div>
                </List.Item>
              </List>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Card bordered={false} className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <Title level={3}>{reportInfo.title}</Title>
            <Space className="text-gray-500">
              <span>系统: {reportInfo.system}</span>
              <span>模块: {reportInfo.module}</span>
              <span>执行时间: {reportInfo.executionTime}</span>
            </Space>
          </div>
          <Space>
            <Button icon={<FilePdfOutlined />}>导出PDF</Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              返回
            </Button>
          </Space>
        </div>

        <Row gutter={16} className="mt-8 text-center">
          <Col span={6}>
            <Statistic title="总用例数" value={reportInfo.stats.total} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
          </Col>
          <Col span={6}>
            <Statistic title="通过用例数" value={reportInfo.stats.passed} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
          </Col>
          <Col span={6}>
            <Statistic title="失败用例数" value={reportInfo.stats.failed} valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }} />
          </Col>
          <Col span={6}>
            <Statistic title="通过率" value={reportInfo.stats.passRate} suffix="%" valueStyle={{ color: '#722ed1', fontWeight: 'bold' }} />
          </Col>
        </Row>
      </Card>

      <div className="bg-white p-4 rounded-lg">
        <Tabs defaultActiveKey="overview" items={items} />
      </div>
    </div>
  );
};
