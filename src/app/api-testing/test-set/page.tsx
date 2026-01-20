'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Table,
  Button,
  Card,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Radio,
  message,
  Tag,
  Popconfirm,
  Badge,
  Descriptions,
  InputNumber,
  Alert,
  Progress,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// 测试集类型定义
interface TestSetType {
  id: string;
  name: string;
  scenarioCount: number;
  combinedScenarioCount: number;
  status: 'active' | 'inactive';
  projectId: string;
  projectName: string;
  remark: string;
  createdBy: string;
}

// 场景类型定义
interface ScenarioType {
  id: string;
  interfaceName: string; // 所属接口
  messageName: string; // 所属报文
  name: string; // 场景名称
  response: string; // 返回报文
  remark: string;
  env: string; // 所属测试环境
  path: string; // 请求路径
  status: 'active' | 'inactive';
  projectName: string;
}

// 组合场景类型定义
interface CombinedScenarioType {
  id: string;
  name: string;
  includedScenarioCount: number;
  successCondition: string; // 成功条件
  runMode: string; // 运行方式
  status: 'active' | 'inactive';
  projectName: string;
  remark: string;
}

// 运行时配置类型
interface RuntimeConfigType {
  templateId?: string;
  connectTimeout: number;
  readTimeout: number;
  maxRetries: number;
  testMode: 'parallel' | 'serial';
  topScenarios?: string;
}

// 公共变量类型
interface PublicVariableType {
  id: string;
  key: string;
  value: string;
}

// 验证规则类型
interface ValidationRuleType {
  id: string;
  identifier: string;
  method: string; // 验证方式
  path: string; // 节点路径/关联规则
  expectedType: string; // 预期验证值类型
  condition: string; // 对比条件
  expectedValue: string; // 预期值
  status: 'active' | 'inactive';
  remark: string;
}

// 模拟数据 - 测试集
const initialData: TestSetType[] = [
  {
    id: '3',
    name: '权限接口测试',
    scenarioCount: 1,
    combinedScenarioCount: 4,
    status: 'active',
    projectId: '1',
    projectName: '某APP客户端项目',
    remark: '',
    createdBy: '刘某某',
  },
  {
    id: '8',
    name: 'changjian',
    scenarioCount: 2,
    combinedScenarioCount: 2,
    status: 'active',
    projectId: '2',
    projectName: '测试项目',
    remark: '',
    createdBy: '张某',
  },
  {
    id: '9',
    name: '测试新增修改',
    scenarioCount: 0,
    combinedScenarioCount: 1,
    status: 'active',
    projectId: '2',
    projectName: '测试项目',
    remark: '',
    createdBy: '王某',
  },
  {
    id: '10',
    name: '123',
    scenarioCount: 0,
    combinedScenarioCount: 1,
    status: 'active',
    projectId: '1',
    projectName: '某APP客户端项目',
    remark: '',
    createdBy: '刘某某',
  },
  {
    id: '12',
    name: 'ceshi0006',
    scenarioCount: 1,
    combinedScenarioCount: 1,
    status: 'active',
    projectId: '1',
    projectName: '某APP客户端项目',
    remark: '',
    createdBy: '刘某某',
  },
];

// 模拟数据 - 场景
const mockScenarios: ScenarioType[] = [
  {
    id: '36',
    interfaceName: 'NqueryYigoF',
    messageName: 'NqueryYigoF',
    name: 'latUDataByKey01',
    response: '{"duRequ...',
    remark: '正常返回响应值',
    env: 'HCM权限操作端口',
    path: '',
    status: 'active',
    projectName: '某APP客户端项目',
  },
  {
    id: '72',
    interfaceName: '测试登录',
    messageName: '测试登录',
    name: '接口通过场景',
    response: '',
    remark: '这是自动创建的正常测试场景',
    env: 'stj测试',
    path: '',
    status: 'active',
    projectName: '某APP客户端项目',
  },
];

// 模拟数据 - 所有可选场景
const allAvailableScenarios: ScenarioType[] = [
  {
    id: '72',
    interfaceName: '测试登录',
    messageName: '测试登录',
    name: '接口通过场景',
    response: '',
    remark: '这是自动创建的正常测试场景',
    env: 'stj测试',
    path: '',
    status: 'active',
    projectName: '某APP客户端项目',
  },
  {
    id: '84',
    interfaceName: '测试采购创建',
    messageName: '创建',
    name: '正常场景',
    response: '{"success...',
    remark: '这是自动创建的正常测试场景',
    env: 'stj测试',
    path: '',
    status: 'active',
    projectName: '某APP客户端项目',
  },
  {
    id: '86',
    interfaceName: '测试登陆',
    messageName: '登陆',
    name: '正常场景',
    response: '{"success...',
    remark: '这是自动创建的正常测试场景',
    env: 'stj测试',
    path: '',
    status: 'active',
    projectName: '某APP客户端项目',
  },
  {
    id: '107',
    interfaceName: '测试接口',
    messageName: '222',
    name: '22222',
    response: '',
    remark: '',
    env: 'stj测试',
    path: '',
    status: 'active',
    projectName: '某APP客户端项目',
  },
];

// 模拟数据 - 组合场景
const mockCombinedScenarios: CombinedScenarioType[] = [
  {
    id: '5',
    name: '8503环境组合场景',
    includedScenarioCount: 15,
    successCondition: '单独统计各场景测试',
    runMode: '使用独立客户端',
    status: 'active',
    projectName: '某APP客户端项目',
    remark: '部分场景配置了其他用工的测试环境',
  },
  {
    id: '6',
    name: '80环境组合场景',
    includedScenarioCount: 9,
    successCondition: '单独统计各场景测试',
    runMode: '使用独立客户端',
    status: 'active',
    projectName: '某APP客户端项目',
    remark: '',
  },
];

// 模拟数据 - 验证规则
const mockValidationRules: ValidationRuleType[] = [
  {
    id: '158',
    identifier: '158',
    method: '节点验证',
    path: 'defaultName',
    expectedType: '常量',
    condition: '等于',
    expectedValue: '1111',
    status: 'active',
    remark: '',
  },
];

export default function TestSetManagementPage() {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  // 运行时配置表单
  const [runtimeForm] = Form.useForm();
  // 验证规则表单
  const [validationRuleForm] = Form.useForm();
  
  const [data, setData] = useState<TestSetType[]>(initialData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 新增/编辑弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 场景列表弹窗状态
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [currentTestSetForScenario, setCurrentTestSetForScenario] = useState<TestSetType | null>(null);
  const [currentScenarios, setCurrentScenarios] = useState<ScenarioType[]>(mockScenarios);
  
  // 组合场景列表弹窗状态
  const [combinedScenarioModalOpen, setCombinedScenarioModalOpen] = useState(false);
  const [currentTestSetForCombined, setCurrentTestSetForCombined] = useState<TestSetType | null>(null);
  const [currentCombinedScenarios, setCurrentCombinedScenarios] = useState<CombinedScenarioType[]>(mockCombinedScenarios);

  // 添加场景弹窗状态
  const [addScenarioModalOpen, setAddScenarioModalOpen] = useState(false);
  const [selectedScenarioKeys, setSelectedScenarioKeys] = useState<React.Key[]>([]);

  // 运行时配置弹窗状态
  const [runtimeConfigModalOpen, setRuntimeConfigModalOpen] = useState(false);
  const [currentRuntimeConfig, setCurrentRuntimeConfig] = useState<RuntimeConfigType>({
    connectTimeout: 3000,
    readTimeout: 2000,
    maxRetries: 3,
    testMode: 'parallel',
  });

  // 公共变量弹窗状态
  const [publicVarsModalOpen, setPublicVarsModalOpen] = useState(false);
  const [publicVars, setPublicVars] = useState<PublicVariableType[]>([]);

  // 验证规则弹窗状态
  const [validationRulesModalOpen, setValidationRulesModalOpen] = useState(false);
  const [currentValidationRules, setCurrentValidationRules] = useState<ValidationRuleType[]>(mockValidationRules);
  const [selectedRuleKeys, setSelectedRuleKeys] = useState<React.Key[]>([]);
  
  // 新增/编辑验证规则弹窗状态
  const [editValidationRuleModalOpen, setEditValidationRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // 测试执行弹窗状态
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [executingTestSet, setExecutingTestSet] = useState<TestSetType | null>(null);

  // ----------------- 列定义 -----------------

  const columns: ColumnsType<TestSetType> = [
    {
      title: '测试集ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      sorter: (a, b) => Number(a.id) - Number(b.id),
    },
    {
      title: '测试集名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '场景数',
      dataIndex: 'scenarioCount',
      key: 'scenarioCount',
      render: (text, record) => (
        <a onClick={() => handleOpenScenarioModal(record)}>
          <Tag color="blue">{text}</Tag>
        </a>
      ),
    },
    {
      title: '组合场景数',
      dataIndex: 'combinedScenarioCount',
      key: 'combinedScenarioCount',
      render: (text, record) => (
        <a onClick={() => handleOpenCombinedScenarioModal(record)}>
          <Tag color="blue">{text}</Tag>
        </a>
      ),
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '有效' : '无效'}
        </Tag>
      ),
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '创建用户',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleEdit(record)}
              style={{ padding: 0 }}
            >
              修改
            </Button>
            <Button 
              type="link" 
              danger 
              size="small" 
              style={{ padding: 0 }}
              onClick={() => handleDeleteConfirm(record)}
            >
              删除
            </Button>
          </Space>
          <Space size="small">
            <Button 
              type="link" 
              size="small" 
              style={{ padding: 0 }}
              onClick={() => handleOpenRuntimeConfig(record)}
            >
              运行时配置
            </Button>
            <Button 
              type="link" 
              size="small" 
              style={{ padding: 0 }}
              onClick={() => handleExecution(record)}
            >
              测试执行
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  const scenarioColumns: ColumnsType<ScenarioType> = [
    { title: '场景ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '所属接口', dataIndex: 'interfaceName', key: 'interfaceName' },
    { title: '所属报文', dataIndex: 'messageName', key: 'messageName' },
    { title: '场景名称', dataIndex: 'name', key: 'name' },
    { title: '返回报文', dataIndex: 'response', key: 'response', ellipsis: true },
    { title: '验证规则', key: 'validation', render: () => <Tag color="blue">0</Tag> },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    { title: '所属测试环境', dataIndex: 'env', key: 'env' },
    { title: '请求路径', dataIndex: 'path', key: 'path' },
    { 
      title: '当前状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '有效' : '无效'}
        </Tag>
      ),
    },
    { title: '所属项目', dataIndex: 'projectName', key: 'projectName' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Button type="link" size="small" style={{ padding: 0 }}>修改</Button>
            <Popconfirm
              title="确定删除该场景？"
              onConfirm={() => handleDeleteScenario(record.id)}
            >
              <Button type="link" danger size="small" style={{ padding: 0 }}>删除</Button>
            </Popconfirm>
          </Space>
          <Space size="small">
            <Button type="link" size="small" style={{ padding: 0 }}>运行时配置</Button>
            <Button type="link" size="small" style={{ padding: 0 }}>测试执行</Button>
          </Space>
        </Space>
      ),
    },
  ];

  const combinedScenarioColumns: ColumnsType<CombinedScenarioType> = [
    { title: '组合场景ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '组合场景名称', dataIndex: 'name', key: 'name' },
    { title: '包含的场景', dataIndex: 'includedScenarioCount', key: 'includedScenarioCount', render: (text) => <Tag color="blue">{text}</Tag> },
    { title: '成功条件', dataIndex: 'successCondition', key: 'successCondition' },
    { title: '运行方式', dataIndex: 'runMode', key: 'runMode', render: (text) => <Tag color="blue">{text}</Tag> },
    { 
      title: '当前状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '有效' : '无效'}
        </Tag>
      ),
    },
    { title: '所属项目', dataIndex: 'projectName', key: 'projectName' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space size="small">
            <Button type="link" size="small" style={{ padding: 0 }}>修改</Button>
            <Popconfirm
              title="确定删除该组合场景？"
              onConfirm={() => handleDeleteCombinedScenario(record.id)}
            >
              <Button type="link" danger size="small" style={{ padding: 0 }}>删除</Button>
            </Popconfirm>
          </Space>
          <Space size="small">
            <Button type="link" size="small" style={{ padding: 0 }}>运行时配置</Button>
            <Button type="link" size="small" style={{ padding: 0 }}>测试执行</Button>
          </Space>
        </Space>
      ),
    },
  ];

  const validationRuleColumns: ColumnsType<ValidationRuleType> = [
    { title: '标识', dataIndex: 'identifier', key: 'identifier' },
    { title: '验证方式', dataIndex: 'method', key: 'method', render: (text) => <Tag color="blue">{text}</Tag> },
    { title: '节点路径/关联规则', dataIndex: 'path', key: 'path' },
    { title: '预期验证值类型', dataIndex: 'expectedType', key: 'expectedType', render: (text) => <Tag color="blue">{text}</Tag> },
    { title: '对比条件', dataIndex: 'condition', key: 'condition' },
    { title: '预期值', dataIndex: 'expectedValue', key: 'expectedValue' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '正常' : '无效'}
        </Tag>
      ),
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEditValidationRule(record)}>修改</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteValidationRule(record.id)}>
            <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ----------------- 处理函数 -----------------

  // 主页面查询
  const handleSearch = (values: any) => {
    const { name } = values;
    let filtered = initialData;
    if (name) {
      filtered = filtered.filter(item => item.name.includes(name));
    }
    setData(filtered);
  };

  // 主页面删除
  const handleDeleteConfirm = (record: TestSetType) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      content: `确定对{id=${record.id}}进行删除操作?`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const newData = data.filter(item => item.id !== record.id);
        setData(newData);
        message.success('删除成功');
      },
    });
  };

  // 主页面批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: () => {
        const newData = data.filter(item => !selectedRowKeys.includes(item.id));
        setData(newData);
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      },
    });
  };

  // 主页面新增/编辑
  const handleEdit = (record: TestSetType) => {
    setModalTitle('修改');
    setEditingId(record.id);
    form.setFieldsValue({ ...record });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setModalTitle('新增');
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingId) {
        const newData = data.map(item => {
          if (item.id === editingId) {
            return {
              ...item,
              ...values,
              projectName: values.projectId === '1' ? '某APP客户端项目' : '测试项目',
            };
          }
          return item;
        });
        setData(newData);
        message.success('修改成功');
      } else {
        const newItem: TestSetType = {
          id: String(Math.max(...data.map(d => Number(d.id)), 0) + 1),
          ...values,
          scenarioCount: 0,
          combinedScenarioCount: 0,
          projectName: values.projectId === '1' ? '某APP客户端项目' : '测试项目',
          createdBy: '当前用户',
        };
        setData([...data, newItem]);
        message.success('新增成功');
      }
      setIsModalOpen(false);
    });
  };

  // ----------------- 场景/组合场景相关 -----------------

  const handleOpenScenarioModal = (record: TestSetType) => {
    setCurrentTestSetForScenario(record);
    // 这里简单模拟：如果是id为3的测试集，显示mockScenarios，否则为空或部分
    // 实际应请求后端
    setCurrentScenarios(mockScenarios);
    setScenarioModalOpen(true);
  };

  const handleOpenCombinedScenarioModal = (record: TestSetType) => {
    setCurrentTestSetForCombined(record);
    setCurrentCombinedScenarios(mockCombinedScenarios);
    setCombinedScenarioModalOpen(true);
  };

  // 场景删除
  const handleDeleteScenario = (id: string) => {
    const newScenarios = currentScenarios.filter(s => s.id !== id);
    setCurrentScenarios(newScenarios);
    message.success('删除成功');
  };

  // 组合场景删除
  const handleDeleteCombinedScenario = (id: string) => {
    const newCombined = currentCombinedScenarios.filter(s => s.id !== id);
    setCurrentCombinedScenarios(newCombined);
    message.success('删除成功');
  };

  // 打开添加场景弹窗
  const handleOpenAddScenarioModal = () => {
    setAddScenarioModalOpen(true);
  };

  // 确认添加场景
  const handleAddScenarioOk = () => {
    // 找出选中的场景
    const selected = allAvailableScenarios.filter(s => selectedScenarioKeys.includes(s.id));
    // 过滤掉已经在列表中的
    const newToAdd = selected.filter(s => !currentScenarios.find(exist => exist.id === s.id));
    
    if (newToAdd.length > 0) {
      setCurrentScenarios([...currentScenarios, ...newToAdd]);
      message.success(`成功添加 ${newToAdd.length} 个场景`);
    } else {
      message.info('未选择新场景或场景已存在');
    }
    setAddScenarioModalOpen(false);
    setSelectedScenarioKeys([]);
  };

  // ----------------- 运行时配置相关 -----------------

  const handleOpenRuntimeConfig = (record: TestSetType) => {
    // 实际应获取该测试集的配置
    setRuntimeConfigModalOpen(true);
    runtimeForm.setFieldsValue({
      connectTimeout: 3000,
      readTimeout: 2000,
      maxRetries: 3,
      testMode: 'parallel',
    });
  };

  const handleRuntimeConfigOk = () => {
    runtimeForm.validateFields().then(values => {
      // 保存逻辑
      console.log('Runtime Config:', values, publicVars);
      message.success('配置保存成功');
      setRuntimeConfigModalOpen(false);
    });
  };

  // ----------------- 测试执行相关 -----------------

  const handleExecution = (record: TestSetType) => {
    setExecutingTestSet(record);
    setExecutionModalOpen(true);
  };

  // ----------------- 公共变量相关 -----------------

  const handleAddPublicVar = () => {
    setPublicVars([...publicVars, { id: Date.now().toString(), key: '', value: '' }]);
  };

  const handlePublicVarChange = (id: string, field: 'key' | 'value', val: string) => {
    const newVars = publicVars.map(v => v.id === id ? { ...v, [field]: val } : v);
    setPublicVars(newVars);
  };

  const handleDeletePublicVar = (id: string) => {
    setPublicVars(publicVars.filter(v => v.id !== id));
  };

  const handleClearPublicVars = () => {
    setPublicVars([]);
  };

  // ----------------- 验证规则相关 -----------------
  
  const handleOpenValidationRules = () => {
    setValidationRulesModalOpen(true);
  };

  const handleEditValidationRule = (record: ValidationRuleType) => {
    setEditingRuleId(record.id);
    setEditValidationRuleModalOpen(true);
    validationRuleForm.setFieldsValue(record);
  };

  const handleAddValidationRule = () => {
    setEditingRuleId(null);
    setEditValidationRuleModalOpen(true);
    validationRuleForm.resetFields();
    validationRuleForm.setFieldsValue({ status: 'active' });
  };

  const handleDeleteValidationRule = (id: string) => {
    setCurrentValidationRules(currentValidationRules.filter(r => r.id !== id));
    message.success('删除成功');
  };

  const handleBatchDeleteValidationRules = () => {
    if (selectedRuleKeys.length === 0) return;
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除选中的验证规则吗？',
      onOk: () => {
        setCurrentValidationRules(currentValidationRules.filter(r => !selectedRuleKeys.includes(r.id)));
        setSelectedRuleKeys([]);
        message.success('批量删除成功');
      },
    });
  };

  const handleValidationRuleOk = () => {
    validationRuleForm.validateFields().then(values => {
      if (editingRuleId) {
        const newRules = currentValidationRules.map(r => r.id === editingRuleId ? { ...r, ...values } : r);
        setCurrentValidationRules(newRules);
        message.success('修改成功');
      } else {
        const newRule = {
          id: Date.now().toString(),
          ...values,
          identifier: values.identifier || Date.now().toString(),
        };
        setCurrentValidationRules([...currentValidationRules, newRule]);
        message.success('添加成功');
      }
      setEditValidationRuleModalOpen(false);
    });
  };

  return (
    <MainLayout title="测试集管理">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
            <Form.Item name="name" label="测试集名称">
              <Input placeholder="请输入测试集名称" allowClear />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
                <Button onClick={() => { searchForm.resetFields(); handleSearch({}); }}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card bordered={false} styles={{ body: { padding: '16px 24px 24px' } }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <Space>
              <Button type="primary" onClick={handleAdd} icon={<PlusOutlined />}>
                新增
              </Button>
              <Button danger onClick={handleBatchDelete} icon={<DeleteOutlined />}>
                批量删除
              </Button>
            </Space>
          </div>
          <Table
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{ total: data.length, pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          />
        </Card>

      {/* 新增/修改测试集弹窗 */}
      <Modal
        title={modalTitle}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="name" label="测试集名称" rules={[{ required: true }]}>
            <Input placeholder="测试集名称" />
          </Form.Item>
          <Form.Item name="status" label="当前状态" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="active">有效</Radio>
              <Radio value="inactive">无效</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input placeholder="备注" />
          </Form.Item>
          <Form.Item name="projectId" label="所属项目" rules={[{ required: true }]}>
            <Select placeholder="点击选择项目">
              <Select.Option value="1">某APP客户端项目</Select.Option>
              <Select.Option value="2">测试项目</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 场景列表弹窗 */}
      <Modal
        title={currentTestSetForScenario ? `${currentTestSetForScenario.name}-测试场景` : '测试场景'}
        open={scenarioModalOpen}
        onCancel={() => setScenarioModalOpen(false)}
        width={1100}
        footer={null}
      >
        <div className="mb-4">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddScenarioModal}>添加场景</Button>
        </div>
        <Table
          columns={scenarioColumns}
          dataSource={currentScenarios}
          rowKey="id"
          pagination={{ total: currentScenarios.length, pageSize: 10 }}
          size="small"
        />
      </Modal>

      {/* 添加场景选择弹窗 */}
      <Modal
        title="选择场景"
        open={addScenarioModalOpen}
        onOk={handleAddScenarioOk}
        onCancel={() => setAddScenarioModalOpen(false)}
        width={1000}
      >
        <div className="mb-4">
          <Input.Search placeholder="输入场景名称查询" style={{ width: 300 }} />
        </div>
        <Table
          rowSelection={{
            selectedRowKeys: selectedScenarioKeys,
            onChange: setSelectedScenarioKeys,
          }}
          columns={[
            { title: '场景ID', dataIndex: 'id' },
            { title: '所属接口', dataIndex: 'interfaceName' },
            { title: '场景名称', dataIndex: 'name' },
            { title: '环境', dataIndex: 'env' },
            { title: '备注', dataIndex: 'remark' },
          ]}
          dataSource={allAvailableScenarios}
          rowKey="id"
          size="small"
        />
      </Modal>

      {/* 组合场景列表弹窗 */}
      <Modal
        title={currentTestSetForCombined ? `${currentTestSetForCombined.name}-组合场景` : '组合场景'}
        open={combinedScenarioModalOpen}
        onCancel={() => setCombinedScenarioModalOpen(false)}
        width={1100}
        footer={null}
      >
        <Table
          columns={combinedScenarioColumns}
          dataSource={currentCombinedScenarios}
          rowKey="id"
          pagination={{ total: currentCombinedScenarios.length, pageSize: 10 }}
          size="small"
        />
      </Modal>

      {/* 运行时配置弹窗 */}
      <Modal
        title="运行时配置"
        open={runtimeConfigModalOpen}
        onOk={handleRuntimeConfigOk}
        onCancel={() => setRuntimeConfigModalOpen(false)}
        width={800}
      >
        <Form form={runtimeForm} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}>
          <Form.Item name="templateId" label="模板">
            <Select placeholder="导入全局变量模板配置，非必填">
              <Select.Option value="1">模板A</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="connectTimeout" label="连接超时" required>
            <InputNumber style={{ width: '100%' }} addonAfter="ms" />
          </Form.Item>
          <Form.Item name="readTimeout" label="读取超时" required>
            <InputNumber style={{ width: '100%' }} addonAfter="ms" />
          </Form.Item>
          <Form.Item name="maxRetries" label="失败时最大重试次数" required>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="testMode" label="测试模式">
            <Select>
              <Select.Option value="parallel">并行测试</Select.Option>
              <Select.Option value="serial">串行测试</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="topScenarios" label="置顶场景">
            <Input placeholder="输入测试集包含的场景ID，用逗号分隔" />
          </Form.Item>
          <Form.Item label="测试集公共信息">
            <Space>
              <Button onClick={() => setPublicVarsModalOpen(true)}>公共变量</Button>
              <Button>HTTP头信息</Button>
              <Button onClick={handleOpenValidationRules}>验证规则</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 公共变量弹窗 */}
      <Modal
        title="测试集公共变量"
        open={publicVarsModalOpen}
        onOk={() => setPublicVarsModalOpen(false)}
        onCancel={() => setPublicVarsModalOpen(false)}
        width={700}
        okText="保存更改"
      >
        <Alert
          message="测试集公共变量的使用方式与全局变量相同；例如：在需要用变量表示的地方填写${_手机号}，此处键值则填写手机号，值处填写变量值即可，如：18888888888；并且在测试集定义的公共变量优先级高于全局变量。"
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPublicVar}>增加</Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleClearPublicVars}>清除所有</Button>
        </Space>
        {publicVars.map((item) => (
          <div key={item.id} style={{ display: 'flex', marginBottom: 8, gap: 8, alignItems: 'center' }}>
            <span>测试集公共变量:</span>
            <Input 
              placeholder="键" 
              value={item.key} 
              onChange={e => handlePublicVarChange(item.id, 'key', e.target.value)} 
              style={{ width: 200 }} 
            />
            <Input 
              placeholder="值" 
              value={item.value} 
              onChange={e => handlePublicVarChange(item.id, 'value', e.target.value)} 
              style={{ width: 200 }} 
            />
            <Button icon={<DeleteOutlined />} onClick={() => handleDeletePublicVar(item.id)} />
          </div>
        ))}
      </Modal>

      {/* 验证规则列表弹窗 */}
      <Modal
        title="测试集公共验证规则"
        open={validationRulesModalOpen}
        onCancel={() => setValidationRulesModalOpen(false)}
        footer={[
            <Button key="back" onClick={() => setValidationRulesModalOpen(false)}>关闭</Button>,
            <Button key="submit" type="primary" onClick={() => setValidationRulesModalOpen(false)}>保存</Button>,
        ]}
        width={1000}
      >
        <div className="mb-4">
          <Space>
            <Button type="primary" onClick={handleAddValidationRule}>添加验证规则</Button>
            <Button danger onClick={handleBatchDeleteValidationRules}>批量删除</Button>
          </Space>
        </div>
        <Table
          rowSelection={{ selectedRowKeys: selectedRuleKeys, onChange: setSelectedRuleKeys }}
          columns={validationRuleColumns}
          dataSource={currentValidationRules}
          rowKey="id"
          size="small"
        />
      </Modal>

      {/* 新增/修改验证规则弹窗 */}
      <Modal
        title={editingRuleId ? "修改验证规则" : "新增验证规则"}
        open={editValidationRuleModalOpen}
        onOk={handleValidationRuleOk}
        onCancel={() => setEditValidationRuleModalOpen(false)}
      >
        <Form form={validationRuleForm} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item name="identifier" label="标识" rules={[{ required: true }]}>
             <Input />
          </Form.Item>
          <Form.Item name="method" label="验证方式" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="节点验证">节点验证</Select.Option>
              <Select.Option value="正则验证">正则验证</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="path" label="节点路径">
            <Input />
          </Form.Item>
          <Form.Item name="expectedType" label="预期验证值类型">
            <Select>
              <Select.Option value="常量">常量</Select.Option>
              <Select.Option value="变量">变量</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="condition" label="对比条件">
            <Select>
              <Select.Option value="等于">等于</Select.Option>
              <Select.Option value="包含">包含</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="expectedValue" label="预期值">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Radio.Group>
              <Radio value="active">正常</Radio>
              <Radio value="inactive">无效</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      {/* 测试执行弹窗 */}
      <Modal
        title={executingTestSet ? `${executingTestSet.name}-测试集测试` : '测试集测试'}
        open={executionModalOpen}
        onCancel={() => setExecutionModalOpen(false)}
        width={800}
        footer={null}
      >
        <div style={{ marginBottom: 20 }}>
          <Alert 
             message={
               <span>
                 测试完成，请至测试报告模块查看测试详细报告! <Button type="link" style={{ padding: 0 }}>查看</Button>
               </span>
             }
             type="info" 
             showIcon 
          />
        </div>

        <Descriptions column={1} bordered size="small" style={{ marginBottom: 20 }}>
          <Descriptions.Item label="测试场景总数">
            <span style={{ fontWeight: 'bold' }}>49</span>
          </Descriptions.Item>
          <Descriptions.Item label="当前测试完成数">
            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>20</span>
          </Descriptions.Item>
          <Descriptions.Item label="当前成功数">
            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>0</span>
          </Descriptions.Item>
          <Descriptions.Item label="当前失败数">
            <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>0</span>
          </Descriptions.Item>
          <Descriptions.Item label="异常中止数">
            <span style={{ color: '#faad14', fontWeight: 'bold' }}>20</span>
          </Descriptions.Item>
          <Descriptions.Item label="跳过执行数">
            <span style={{ fontWeight: 'bold' }}>29</span>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 8 }}>当前进度：</span>
          <Progress percent={100} strokeColor="#1890ff" />
        </div>

        <Alert
          message="注意"
          description="组合场景成功条件为“全部场景测试通过”时，场景数以1个统计；跳过执行数以单场景总数数据统计。可能出现跳过执行数大于测试场景总数的情况。"
          type="warning"
          showIcon
          style={{ fontSize: 12 }}
        />
      </Modal>
    </div>
    </MainLayout>
  );
}
