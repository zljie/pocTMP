'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Tag } from 'antd';
import {
  FileTextOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  RiseOutlined,
  BugOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';
import { mockTestCases, mockTestRequirements, mockTestPlans } from '@/mock/data';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = {
    totalCases: mockTestCases.length,
    totalRequirements: mockTestRequirements.length,
    totalPlans: mockTestPlans.length,
    passedRate: 85,
    executedCases: 156,
    bugCount: 23,
  };

  const recentPlans = mockTestPlans.slice(0, 3);

  // 测试执行趋势图配置
  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['执行用例数', '通过用例数', '失败用例数'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: { type: 'value' },
    series: [
      { name: '执行用例数', type: 'line', smooth: true, data: [32, 45, 38, 52, 48, 35, 42], itemStyle: { color: '#1890ff' } },
      { name: '通过用例数', type: 'line', smooth: true, data: [28, 40, 35, 48, 44, 32, 38], itemStyle: { color: '#52c41a' } },
      { name: '失败用例数', type: 'line', smooth: true, data: [4, 5, 3, 4, 4, 3, 4], itemStyle: { color: '#ff4d4f' } },
    ],
  };

  // 模块分布饼图配置
  const moduleOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: 25, name: '组织模块', itemStyle: { color: '#1890ff' } },
        { value: 18, name: '薪酬模块', itemStyle: { color: '#52c41a' } },
        { value: 22, name: '人事模块', itemStyle: { color: '#722ed1' } },
        { value: 15, name: '权限模块', itemStyle: { color: '#faad14' } },
        { value: 20, name: '其他模块', itemStyle: { color: '#13c2c2' } },
      ],
    }],
  };

  // 需求状态分布配置
  const requirementOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '70%',
      data: [
        { value: 2, name: '待评审', itemStyle: { color: '#1890ff' } },
        { value: 2, name: '已通过', itemStyle: { color: '#52c41a' } },
        { value: 0, name: '已驳回', itemStyle: { color: '#ff4d4f' } },
        { value: 1, name: '已关闭', itemStyle: { color: '#d9d9d9' } },
      ],
      label: { formatter: '{b}\n{c}个' },
    }],
  };

  return (
    <MainLayout title="首页">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="测试用例总数"
              value={stats.totalCases}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="测试需求总数"
              value={stats.totalRequirements}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="本周执行用例"
              value={stats.executedCases}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="用例通过率"
              value={stats.passedRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="测试执行趋势" styles={{ body: { padding: '12px 24px' } }}>
            {mounted && <ReactECharts option={trendOption} style={{ height: 280 }} />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="用例模块分布" styles={{ body: { padding: '12px 24px' } }}>
            {mounted && <ReactECharts option={moduleOption} style={{ height: 280 }} />}
          </Card>
        </Col>
      </Row>

      {/* 数据表格区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="需求状态分布" styles={{ body: { padding: '12px 24px' } }}>
            {mounted && <ReactECharts option={requirementOption} style={{ height: 240 }} />}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="进行中的测试计划">
            <Table
              dataSource={recentPlans}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '计划名称', dataIndex: 'name', key: 'name', ellipsis: true },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 90,
                  render: (status: string) => {
                    const icon = status === '进行中' ? <SyncOutlined spin /> : <ClockCircleOutlined />;
                    return <Tag icon={icon} color={status === '进行中' ? 'processing' : 'default'}>{status}</Tag>;
                  },
                },
                {
                  title: '进度',
                  dataIndex: 'progress',
                  key: 'progress',
                  width: 100,
                  render: (progress: number) => <Progress percent={progress} size="small" />,
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="最近更新的用例">
            <Table
              dataSource={mockTestCases.slice(0, 4)}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'ID', dataIndex: 'id', key: 'id', width: 50 },
                { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
                { title: '模块', dataIndex: 'module', key: 'module', width: 60 },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
