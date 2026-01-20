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
  message,
  Popconfirm,
  Radio,
  InputNumber,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '@/components/layout/MainLayout';

// 变量模板类型定义
interface VariableTemplateType {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  type: string;
  key: string;
  value: string; // 存储JSON字符串或直接值
  creator: string;
  status: 'active' | 'inactive';
  remark: string;
}

// 模拟项目数据
const mockProjects = [
  { label: '电商前台项目', value: 'p1' },
  { label: '后台管理系统', value: 'p2' },
  { label: '支付网关服务', value: 'p3' },
];

// 变量类型选项
const variableTypeOptions = [
  // 数据导入类
  { label: 'HTTP协议调用参数', value: 'HTTP' },
  { label: 'Socket协议调用参数', value: 'SOCKET' },
  { label: '验证关联规则', value: 'VALIDATION' },
  { label: '测试集运行时配置', value: 'TEST_SET_CONFIG' },
  // 参数替换类
  { label: '常量', value: 'CONSTANT' },
  { label: '日期', value: 'DATE' },
  { label: '随机数', value: 'RANDOM' },
  { label: '时间戳', value: 'TIMESTAMP' },
  { label: '随机字符串', value: 'RANDOM_STRING' },
  { label: 'UUID', value: 'UUID' },
  { label: '动态接口', value: 'DYNAMIC_INTERFACE' },
  { label: '数据库取值', value: 'DB_VALUE' },
];

// 模拟数据
const initialData: VariableTemplateType[] = [
  {
    id: '2',
    projectId: 'p1',
    projectName: '电商前台项目',
    name: 'test',
    type: 'CONSTANT',
    key: '${__test}',
    value: 'test',
    creator: 'admin',
    status: 'inactive',
    remark: '',
  },
  {
    id: '3',
    projectId: 'p1',
    projectName: '电商前台项目',
    name: 'test2',
    type: 'HTTP',
    key: '${__11}',
    value: JSON.stringify({ Headers: { type: '1' }, Method: 'POST' }),
    creator: 'admin',
    status: 'active',
    remark: '',
  },
  {
    id: '16',
    projectId: 'p2',
    projectName: '后台管理系统',
    name: 'time',
    type: 'TIMESTAMP',
    key: '${__time}',
    value: JSON.stringify({ timeOffset: '100' }),
    creator: 'admin',
    status: 'active',
    remark: '',
  },
];

export default function VariableTemplatePage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  // HTTP配置表单
  const [httpForm] = Form.useForm();
  // 日期配置表单
  const [dateForm] = Form.useForm();
  // 数据库取值配置表单
  const [dbForm] = Form.useForm();
  // 随机字符串配置表单
  const [randomStringForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VariableTemplateType[]>(initialData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 主弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 当前选择的变量类型
  const [currentType, setCurrentType] = useState<string>('');

  // 配置弹窗状态
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configType, setConfigType] = useState<string>(''); // HTTP, DATE, etc.
  const [currentConfigValue, setCurrentConfigValue] = useState<any>({});

  // 搜索处理
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const name = values.name?.toLowerCase();
    
    if (!name) {
      setData(initialData);
      return;
    }

    const filtered = initialData.filter(item => 
      item.name.toLowerCase().includes(name)
    );
    setData(filtered);
    message.success('查询成功');
  };

  const handleReset = () => {
    searchForm.resetFields();
    setData(initialData);
  };

  // 新增/编辑处理
  const handleAdd = () => {
    setModalTitle('新增');
    setEditingId(null);
    form.resetFields();
    setCurrentType('');
    setIsModalOpen(true);
  };

  const handleEdit = (record: VariableTemplateType) => {
    setModalTitle('修改');
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      // 这里的 key 需要去掉 ${__ 和 } 吗？ 需求说 "使用时我们以 ${__变量 key 值}表示"，
      // 但界面上"变量key"输入框可能只需要输入 key 值。
      // 截图显示列表里是 ${__test}，但新增弹窗里 label 是 "变量key值"。
      // 假设输入框里输入 "test"，存的时候存 "${__test}" 或者展示的时候拼。
      // 为了简化，这里假设输入框就是全量或者部分。
      // 截图2显示输入框里是 "变量key值"。
      // 这里暂时保持原值
    });
    setCurrentType(record.type);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
    message.success('删除成功');
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: () => {
        setData(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      },
    });
  };

  // 打开配置弹窗
  const openConfigModal = () => {
    const type = form.getFieldValue('type');
    if (!type) {
      message.warning('请先选择变量类型');
      return;
    }
    
    // 从当前表单获取已有的值（如果有）
    const currentValueStr = form.getFieldValue('value');
    let currentValue = {};
    try {
        if (currentValueStr && type !== 'CONSTANT') {
            currentValue = JSON.parse(currentValueStr);
        }
    } catch (e) {
        // ignore
    }

    setConfigType(type);
    setCurrentConfigValue(currentValue);
    
    if (type === 'HTTP') {
        httpForm.setFieldsValue(currentValue);
    } else if (type === 'DATE') {
        dateForm.setFieldsValue(currentValue);
    } else {
        // 其他类型暂时没有具体配置页面，可以用通用JSON编辑或者提示
        message.info('该类型暂无详细配置页面，请直接在值输入框输入');
        return;
    }
    
    setIsConfigModalOpen(true);
  };

  // 保存配置
  const handleConfigOk = () => {
      let values = {};
      if (configType === 'HTTP') {
          values = httpForm.getFieldsValue();
      } else if (configType === 'DATE') {
          values = dateForm.getFieldsValue();
      }
      
      // 将配置转为JSON字符串回填到主表单的value字段
      // 注意：这里可能需要根据业务逻辑处理，比如有些类型不需要转JSON
      form.setFieldsValue({
          value: JSON.stringify(values)
      });
      
      setIsConfigModalOpen(false);
      message.success('配置已保存');
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      setTimeout(() => {
        const project = mockProjects.find(p => p.value === values.projectId);
        const projectName = project ? project.label : '';

        // 处理 key 格式，如果用户没输入 ${__ 前缀，自动加上 (这里仅做示例逻辑)
        let key = values.key;
        if (key && !key.startsWith('${__')) {
            key = '${__' + key + '}';
        }

        if (editingId) {
          setData((prev) =>
            prev.map((item) =>
              item.id === editingId
                ? { ...item, ...values, key, projectName }
                : item
            )
          );
          message.success('修改成功');
        } else {
          const newId = String(Math.max(...data.map(d => Number(d.id)), 0) + 1);
          const newItem: VariableTemplateType = {
            id: newId,
            ...values,
            key,
            projectName,
            creator: '当前用户', // 模拟
          };
          setData((prev) => [newItem, ...prev]);
          message.success('新增成功');
        }
        setLoading(false);
        setIsModalOpen(false);
      }, 500);
    });
  };

  const columns: ColumnsType<VariableTemplateType> = [
    {
      title: '变量ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '变量名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '变量类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => {
          const found = variableTypeOptions.find(opt => opt.value === type);
          return found ? found.label : type;
      }
    },
    {
      title: '变量key',
      dataIndex: 'key',
      key: 'key',
      width: 150,
    },
    {
      title: '变量值',
      dataIndex: 'value',
      key: 'value',
      width: 200,
      ellipsis: true,
      render: (val) => {
          if (typeof val === 'string' && val.length > 50) {
              return val.substring(0, 50) + '...';
          }
          return val;
      }
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'active' ? 'blue' : 'red'}>
          {status === 'active' ? '有效' : '无效'}
        </Tag>
      ),
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
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
            style={{ padding: 0 }}
          >
            修改
          </Button>
          <Popconfirm
            title="确定删除该变量模板吗？"
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
    <MainLayout title="变量模板信息管理">
      <div className="p-4">
        {/* 搜索区域 */}
        <Card bordered={false} style={{ marginBottom: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="name" label="变量名称">
              <Input placeholder="请输入变量名称" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSearch}>
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
            scroll={{ x: 1500 }}
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
              <Select placeholder="点击选择项目" options={mockProjects} disabled={!!editingId} />
            </Form.Item>

            <Form.Item
              name="name"
              label="变量名称"
              rules={[{ required: true, message: '请输入变量名称' }]}
            >
              <Input placeholder="变量名称" maxLength={50} showCount />
            </Form.Item>

            <Form.Item
              name="type"
              label="变量类型"
              rules={[{ required: true, message: '请选择变量类型' }]}
            >
              <Select 
                  placeholder="请选择" 
                  options={variableTypeOptions} 
                  disabled={!!editingId}
                  onChange={(val) => {
                      setCurrentType(val);
                      // 切换类型时清空值
                      form.setFieldValue('value', '');
                  }}
              />
            </Form.Item>

            <Form.Item
              name="key"
              label="变量key"
              rules={[{ required: true, message: '请输入变量key' }]}
              extra="系统将自动添加 ${__ 前缀和 } 后缀"
            >
              <Input placeholder="变量key值" />
            </Form.Item>

            {currentType === 'CONSTANT' ? (
                <Form.Item
                  name="value"
                  label="变量值"
                  rules={[{ required: true, message: '请输入变量值' }]}
                >
                  <Input placeholder="变量值" />
                </Form.Item>
            ) : (
                <Form.Item
                  name="value"
                  label="变量值"
                  rules={[{ required: true, message: '请配置变量值' }]}
                >
                   <div style={{ display: 'flex', gap: '8px' }}>
                       <Input disabled placeholder="请点击配置按钮" />
                       <Button type="primary" onClick={openConfigModal}>配置</Button>
                   </div>
                </Form.Item>
            )}

            <Form.Item
              name="status"
              label="当前状态"
              initialValue="active"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Radio.Group>
                  <Radio value="active">有效</Radio>
                  <Radio value="inactive">无效</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="备注" rows={3} maxLength={255} showCount />
            </Form.Item>
          </Form>
        </Modal>

        {/* 详细配置弹窗 */}
        <Modal
            title={configType === 'HTTP' ? 'HTTP调用参数配置' : configType === 'DATE' ? '日期配置' : '配置'}
            open={isConfigModalOpen}
            onOk={handleConfigOk}
            onCancel={() => setIsConfigModalOpen(false)}
            width={700}
        >
            {configType === 'HTTP' && (
                <Form form={httpForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                    <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
                        提示：如你不清楚以下参数的具体含义和规则，请仔细阅读全局变量模板参数帮助手册。
                    </div>
                    {/* 这里简化实现，用TextArea代替复杂的动态添加 */}
                    <Form.Item name="Headers" label="Headers">
                        <Input.TextArea placeholder='{"key": "value"}' rows={2} />
                    </Form.Item>
                    <Form.Item name="Querys" label="Querys">
                         <Input.TextArea placeholder='{"key": "value"}' rows={2} />
                    </Form.Item>
                    <Form.Item name="Authorization" label="Authorization">
                         <Input.TextArea placeholder='Authorization Value' rows={1} />
                    </Form.Item>
                    <Form.Item name="Method" label="Method">
                        <Select options={[
                            { label: 'GET', value: 'GET' },
                            { label: 'POST', value: 'POST' },
                            { label: 'PUT', value: 'PUT' },
                            { label: 'DELETE', value: 'DELETE' }
                        ]} />
                    </Form.Item>
                    <Form.Item name="ConnectTimeOut" label="ConnectTimeOut">
                        <Input placeholder="ConnectTimeOut" />
                    </Form.Item>
                    <Form.Item name="ReadTimeOut" label="ReadTimeOut">
                        <Input placeholder="ReadTimeOut" />
                    </Form.Item>
                </Form>
            )}

            {configType === 'DATE' && (
                <Form form={dateForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                    <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
                        提示：如你不清楚以下参数的具体含义和规则，请仔细阅读全局变量模板参数帮助手册。
                    </div>
                    <div style={{ marginBottom: 16 }}>
                         - 年份yyyy - 月份MM - 日期dd <br/>
                         - 小时(24小时制)HH 或 小时(12小时制)hh - 分钟mm - 秒钟ss
                    </div>
                    <Form.Item name="dateFormat" label="日期格式化" initialValue="yyyy-MM-dd HH:mm:ss">
                        <Input placeholder="yyyy-MM-dd HH:mm:ss" />
                    </Form.Item>
                    <Form.Item name="dayOffset" label="日期偏移天数">
                        <InputNumber placeholder="可填写小数、负数" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            )}

            {configType === 'DB_VALUE' && (
                <Form form={dbForm} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
                    <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
                        提示：如你不清楚以下参数的具体含义和规则，请仔细阅读全局变量模板参数帮助手册。
                    </div>
                    <Form.Item name="dataSource" label="数据源">
                        <Select placeholder="请选择" options={[
                            { label: 'MySQL-Test-DB', value: 'db1' },
                            { label: 'Oracle-Prod-DB', value: 'db2' },
                        ]} />
                    </Form.Item>
                    <Form.Item name="sql" label="执行SQL">
                        <Input.TextArea placeholder="必填，请不要输入多条SQL或者换行输入" rows={4} />
                    </Form.Item>
                    <Form.Item name="rowIndex" label="取值行号" extra="如果查询出来有多行数据则按照此值获取指定行数据，默认为1">
                        <InputNumber placeholder="1" style={{ width: '100%' }} min={1} />
                    </Form.Item>
                    <Form.Item name="colIndex" label="取值列号" extra="如果查询出来有多列名则按照此值获取指定列数据，默认为1">
                        <InputNumber placeholder="1" style={{ width: '100%' }} min={1} />
                    </Form.Item>
                </Form>
            )}

            {configType === 'RANDOM_STRING' && (
                <Form form={randomStringForm} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
                    <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
                        提示：如你不清楚以下参数的具体含义和规则，请仔细阅读全局变量模板参数帮助手册。
                    </div>
                    <Form.Item name="mode" label="模式">
                        <Select placeholder="请选择" options={[
                            { label: '只包含小写字母', value: 'lower' },
                            { label: '只包含大写字母', value: 'upper' },
                            { label: '包含大小写字母', value: 'mixed' },
                            { label: '包含字母和数字', value: 'alphanumeric' },
                        ]} />
                    </Form.Item>
                    <Form.Item name="length" label="字符串长度">
                        <InputNumber placeholder="请输入长度" style={{ width: '100%' }} min={1} />
                    </Form.Item>
                </Form>
            )}
        </Modal>
      </div>
    </MainLayout>
  );
}
