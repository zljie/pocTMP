'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '@/components/layout/MainLayout';
import dataSourceStore, { DataSource } from '@/stores/dataSourceStore';
import { deepseekChat, toMessages } from '@/lib/deepseek';

// 模拟项目数据
const mockProjects = [
  { label: '电商前台项目', value: 'p1' },
  { label: '后台管理系统', value: 'p2' },
  { label: '支付网关服务', value: 'p3' },
];

const dbTypeOptions = [
  { label: 'MySQL', value: 'mysql' },
  { label: 'Oracle', value: 'oracle' },
  { label: 'SQL Server', value: 'sqlserver' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'MongoDB', value: 'mongodb' },
  { label: 'Redis', value: 'redis' },
];

export default function DataSourceConfigurationPage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  const [data, setData] = useState<DataSource[]>(dataSourceStore.getSnapshot());
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增数据源');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string>('');
  const [aiTarget, setAiTarget] = useState<DataSource | null>(null);

  const [sqlOpen, setSqlOpen] = useState(false);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlPrompt, setSqlPrompt] = useState('');
  const [sqlResult, setSqlResult] = useState<string>('');

  // 监听 store 变化
  useEffect(() => {
    const unsubscribe = dataSourceStore.subscribe(() => {
      setData(dataSourceStore.getSnapshot());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // 搜索处理
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const address = values.connectionAddress?.toLowerCase();
    
    let filtered = dataSourceStore.getSnapshot();
    
    if (address) {
      filtered = filtered.filter(item => 
        item.connectionAddress.toLowerCase().includes(address)
      );
    }
    
    setData(filtered);
    message.success('查询成功');
  };

  const handleReset = () => {
    searchForm.resetFields();
    setData(dataSourceStore.getSnapshot());
  };

  // 新增/编辑处理
  const handleAdd = () => {
    setModalTitle('新增');
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: DataSource) => {
    setModalTitle('修改');
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
    });
    setIsModalOpen(true);
  };

  const openAiCheck = async (record: DataSource) => {
    setAiTarget(record);
    setAiOpen(true);
    setAiError(null);
    setAiText('');
    setAiLoading(true);

    try {
      const system = '你是智能测试平台的数据源配置审查助手。请输出简洁要点列表（纯文本），不输出多余内容。';
      const user = `数据源信息：\n- dbType: ${record.dbType}\n- connectionAddress: ${record.connectionAddress}\n- dbName: ${record.dbName}\n- username: ${record.username}\n- projectName: ${record.projectName}\n- remark: ${record.remark || ''}\n\n请检查可能的配置问题与安全风险（不要输出任何密码）。`;
      const { content } = await deepseekChat({
        messages: toMessages(user, system),
        temperature: 0.2,
        max_tokens: 600,
      });
      setAiText(content);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI 自检失败';
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const openSqlHelper = () => {
    setSqlPrompt('');
    setSqlResult('');
    setSqlError(null);
    setSqlOpen(true);
  };

  const runSqlHelper = async () => {
    if (!sqlPrompt.trim()) {
      setSqlError('请输入查询需求');
      return;
    }
    setSqlError(null);
    setSqlResult('');
    setSqlLoading(true);
    try {
      const system =
        '你是智能测试平台的 SQL 助手。请只输出一段可执行的 SQL（不要 Markdown 代码块），并假设为只读查询。';
      const user = `数据库类型：${searchForm.getFieldValue('dbType') || ''}\n需求：${sqlPrompt}\n请输出 SQL。`;
      const { content } = await deepseekChat({
        messages: toMessages(user, system),
        temperature: 0.2,
        max_tokens: 600,
      });
      setSqlResult(content);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI 生成 SQL 失败';
      setSqlError(msg);
    } finally {
      setSqlLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    dataSourceStore.removeOne(id);
    message.success('删除成功');
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    Modal.confirm({
      title: '提示',
      content: (
        <span>
          <span style={{ color: '#faad14', marginRight: 8 }}>!</span>
          确定对[id={selectedRowKeys.join(',')}]进行[批量删除]操作?
        </span>
      ),
      onOk: () => {
        dataSourceStore.removeMany(selectedRowKeys as string[]);
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      // 模拟请求延迟
      setTimeout(() => {
        // 获取项目名称
        const project = mockProjects.find(p => p.value === values.projectId);
        const projectName = project ? project.label : '';
        
        const payload = { ...values, projectName };

        if (editingId) {
          dataSourceStore.update(editingId, payload);
          message.success('修改成功');
        } else {
          dataSourceStore.create(payload);
          message.success('新增成功');
        }
        
        setLoading(false);
        setIsModalOpen(false);
        
        // 如果当前有搜索条件，需要重新应用搜索或重置搜索
        // 这里简单处理：若在搜索状态下新增/修改，暂时重置搜索以显示最新数据
        // 或者也可以重新过滤，但 store 订阅会自动更新 data，这里手动调 handleSearch 可能更好
        // 为简单起见，这里不做额外处理，useEffect 会更新 data 为全量，然后我们再过滤一遍？
        // 其实 useEffect 设置 data 为 snapshot，会覆盖当前的过滤结果。
        // 改进：useEffect 中应该只更新 source data，过滤逻辑应该在 render 或者 memo 中处理
        // 但为了简单，这里我们在操作后重置搜索
        searchForm.resetFields(); 
        // 实际上 store 更新后会触发 useEffect，重置 data 为全量
      }, 500);
    });
  };

  const columns: ColumnsType<DataSource> = [
    {
      title: '数据源ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      sorter: (a, b) => Number(a.id) - Number(b.id),
      align: 'center',
    },
    {
      title: '数据库类型',
      dataIndex: 'dbType',
      key: 'dbType',
      width: 120,
      align: 'center',
    },
    {
      title: '连接地址',
      dataIndex: 'connectionAddress',
      key: 'connectionAddress',
      width: 200,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '数据库名',
      dataIndex: 'dbName',
      key: 'dbName',
      width: 150,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '数据库用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '数据库密码',
      dataIndex: 'password',
      key: 'password',
      width: 150,
      ellipsis: true,
      align: 'center',
      render: (text) => text ? '******' : '-',
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => openAiCheck(record)}>
            AI自检
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
            style={{ padding: 0 }}
          >
            修改
          </Button>
          <Popconfirm
            title="确定删除该数据源吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger size="small" style={{ padding: 0 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="数据源配置">
      <div className="p-4">
        {/* 搜索区域 */}
        <Card bordered={false} style={{ marginBottom: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="connectionAddress">
              <Input placeholder="连接地址" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button onClick={handleSearch}>
                  查询
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* 表格区域 */}
        <Card bordered={false} styles={{ body: { padding: '16px 24px 24px' } }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <Space>
              <Button type="primary" onClick={handleAdd}>
                新增
              </Button>
              <Button danger onClick={handleBatchDelete}>
                批量删除
              </Button>
              <Button onClick={openSqlHelper}>AI SQL建议</Button>
            </Space>
          </div>
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
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            scroll={{ x: 1300 }}
            size="middle"
          />
        </Card>

        {/* 新增/编辑弹窗 */}
        <Modal
          title={modalTitle}
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={() => setIsModalOpen(false)}
          width={600}
        >
          <Form form={form} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            <Form.Item
              name="projectId"
              label="所属项目"
              rules={[{ required: true, message: '请选择所属项目' }]}
            >
              <Select placeholder="点击选择项目" options={mockProjects} />
            </Form.Item>

            <Form.Item
              name="dbType"
              label="数据库类型"
              rules={[{ required: true, message: '请选择数据库类型' }]}
            >
              <Select placeholder="请选择" options={dbTypeOptions} />
            </Form.Item>

            <Form.Item
              name="connectionAddress"
              label="连接地址"
              rules={[{ required: true, message: '请输入连接地址' }]}
            >
              <Input placeholder="数据库主机IP:端口号" maxLength={120} showCount />
            </Form.Item>

            <Form.Item
              name="dbName"
              label="数据库名"
              rules={[{ required: true, message: '请输入数据库名' }]}
            >
              <Input placeholder="数据库名" maxLength={50} showCount />
            </Form.Item>

            <Form.Item
              name="username"
              label="数据库用户名"
              rules={[{ required: true, message: '请输入数据库用户名' }]}
            >
              <Input placeholder="数据库用户名" maxLength={50} showCount />
            </Form.Item>

            <Form.Item
              name="password"
              label="数据库密码"
              rules={[{ required: true, message: '请输入数据库密码' }]}
            >
              <Input.Password placeholder="数据库密码" maxLength={50} showCount />
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="备注" rows={3} maxLength={255} showCount />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`AI 自检 - ${aiTarget?.dbName || ''}`}
          open={aiOpen}
          onCancel={() => setAiOpen(false)}
          footer={null}
          width={900}
        >
          {aiLoading ? <Alert type="info" message="AI 正在分析，请稍候..." showIcon /> : null}
          {aiError ? <Alert type="error" message={aiError} showIcon style={{ marginTop: 12 }} /> : null}
          {aiText ? (
            <pre style={{ marginTop: 12, padding: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
              {aiText}
            </pre>
          ) : null}
        </Modal>

        <Modal
          title="AI SQL建议"
          open={sqlOpen}
          onCancel={() => setSqlOpen(false)}
          onOk={runSqlHelper}
          okText="生成"
          confirmLoading={sqlLoading}
          width={900}
        >
          <div style={{ marginBottom: 8, color: '#666' }}>输入查询目标或表字段描述，生成只读查询 SQL（不会在平台执行）。</div>
          <Input.TextArea
            rows={5}
            placeholder="例如：查询最近7天登录失败的用户数，按天分组"
            value={sqlPrompt}
            onChange={(e) => setSqlPrompt(e.target.value)}
          />
          {sqlError ? <Alert type="error" message={sqlError} showIcon style={{ marginTop: 12 }} /> : null}
          {sqlResult ? (
            <pre style={{ marginTop: 12, padding: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
              {sqlResult}
            </pre>
          ) : null}
        </Modal>
      </div>
    </MainLayout>
  );
}
