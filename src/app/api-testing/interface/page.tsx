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
  Upload,
  Switch,
  Alert,
  Radio,
  Tabs,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps, UploadFile } from 'antd';
import MainLayout from '@/components/layout/MainLayout';
import { postJson } from '@/lib/ai/client';
import sceneStore from '@/stores/sceneStore';
import messageStore, { MessageType } from '@/stores/messageStore';

type AiScenario = {
  name: string;
  category: 'normal' | 'boundary' | 'exception' | 'auth' | 'idempotency' | 'other';
  requestExample?: string;
  assertions?: string[];
  notes?: string;
};

type AiSceneGenResult = {
  summary: string;
  scenarios: AiScenario[];
};

// 接口类型定义
interface InterfaceType {
  id: string;
  key: string;
  name: string; // 接口英文名
  name_cn: string; // 接口中文名
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'WebSocket' | 'SSE' | 'Socket.IO' | 'MQTT'; // HTTP方法 + Realtime
  path: string; // 请求路径
  protocol: 'HTTP' | 'HTTPS'; // 协议
  status: 'active' | 'inactive'; // 状态
  type: 'REST' | 'GraphQL' | 'Realtime'; // 接口类型
  contentType?: string; // Content-Type
  parameterCount: number; // 参数个数
  remark: string; // 备注
  projectId: string; // 所属项目ID
  projectName: string; // 所属项目名称
}

// 接口参数类型定义
interface InterfaceParamType {
  id: string;
  interfaceId: string;
  identifier: string; // 标识
  name: string; // 名称
  paramIn: 'path' | 'body' | 'query' | 'header'; // 参数位置
  required: boolean; // 是否必填
  defaultValue: string; // 默认值
  path: string; // 路径
  type: string; // 类型
  remark: string; // 备注
}

// 模拟项目数据
const mockProjects = [
  { label: '电商前台项目', value: 'p1' },
  { label: '后台管理系统', value: 'p2' },
  { label: '支付网关服务', value: 'p3' },
];

// 颜色映射
const methodColorMap: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
  WebSocket: 'purple',
  SSE: 'cyan',
  'Socket.IO': 'geekblue',
  MQTT: 'magenta',
};

// 模拟接口数据
const initialData: InterfaceType[] = [
  {
    id: '9',
    key: '9',
    name: 'NQueryYigoFlatData',
    name_cn: '通过用户ID获取用户...',
    method: 'GET',
    path: '/FlatDataService/query...',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 3,
    remark: '',
    projectId: 'p1',
    projectName: '电商前台项目',
  },
  {
    id: '10',
    key: '10',
    name: 'NQueryFlatMDataByE...',
    name_cn: '通过菜单入口ID获取...',
    method: 'POST',
    path: '/FlatDataService/query...',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 3,
    remark: '',
    projectId: 'p1',
    projectName: '电商前台项目',
  },
  {
    id: '11',
    key: '11',
    name: 'NLogin-IT001',
    name_cn: '登录',
    method: 'POST',
    path: '/authsso/login',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 3,
    remark: '',
    projectId: 'p2',
    projectName: '后台管理系统',
  },
  {
    id: '12',
    key: '12',
    name: 'NdecryptionAuthInfo',
    name_cn: '用户身份认证',
    method: 'POST',
    path: '/authsso/decryption...',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 3,
    remark: '',
    projectId: 'p2',
    projectName: '后台管理系统',
  },
  {
    id: '13',
    key: '13',
    name: 'NQueryFlatDataByKey',
    name_cn: '通过用户ID获取用户...',
    method: 'GET',
    path: '/FlatDataService/query...',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 2,
    remark: '',
    projectId: 'p1',
    projectName: '电商前台项目',
  },
  {
    id: '14',
    key: '14',
    name: 'NQueryFlatMDataByE...',
    name_cn: '通过菜单入口路径获...',
    method: 'POST',
    path: '/FlatDataService/query...',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 3,
    remark: '',
    projectId: 'p1',
    projectName: '电商前台项目',
  },
  {
    id: '15',
    key: '15',
    name: 'NQueryUserIdByNam...',
    name_cn: '通过用户名和租户id...',
    method: 'GET',
    path: '/userService/queryU...',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 3,
    remark: '',
    projectId: 'p2',
    projectName: '后台管理系统',
  },
  {
    id: '16',
    key: '16',
    name: 'Nlogout-IT001',
    name_cn: '登出',
    method: 'POST',
    path: '/authsso/logout',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 1,
    remark: '',
    projectId: 'p2',
    projectName: '后台管理系统',
  },
  {
    id: '18',
    key: '18',
    name: 'login',
    name_cn: '登录',
    method: 'POST',
    path: '/authsso/login',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 1,
    remark: '',
    projectId: 'p2',
    projectName: '后台管理系统',
  },
  {
    id: '20',
    key: '20',
    name: 'testlogin',
    name_cn: '测试登录',
    method: 'POST',
    path: '/atmngplat/#/login',
    protocol: 'HTTP',
    status: 'active',
    type: 'REST',
    parameterCount: 1,
    remark: '',
    projectId: 'p3',
    projectName: '支付网关服务',
  },
];

// 模拟参数数据 (更新为 path/body)
const initialParams: InterfaceParamType[] = [
  { id: '1', interfaceId: '9', identifier: 'userKey', name: '用户Key', paramIn: 'path', required: true, defaultValue: '', path: 'TopRoot', type: 'String', remark: '' },
  { id: '2', interfaceId: '9', identifier: 'userID', name: '用户ID', paramIn: 'path', required: true, defaultValue: '', path: 'TopRoot', type: 'String', remark: '' },
  { id: '3', interfaceId: '9', identifier: 'ceshi', name: '测试', paramIn: 'body', required: false, defaultValue: '', path: '', type: 'String', remark: '' },
];

export default function InterfaceManagementPage() {
  const [form] = Form.useForm();
  const method = Form.useWatch('method', form);
  const interfaceType = Form.useWatch('type', form);
  const [searchForm] = Form.useForm();
  const [importForm] = Form.useForm();
  
  // 参数表单
  const [paramForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InterfaceType[]>(initialData);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 接口新增/编辑弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增接口');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 导入弹窗状态
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // 参数管理状态
  const [params, setParams] = useState<InterfaceParamType[]>(initialParams);
  const [paramModalVisible, setParamModalVisible] = useState(false);
  const [currentInterface, setCurrentInterface] = useState<InterfaceType | null>(null);
  const [currentParams, setCurrentParams] = useState<InterfaceParamType[]>([]);
  const [selectedParamKeys, setSelectedParamKeys] = useState<React.Key[]>([]);
  
  // 参数新增/编辑状态
  const [paramFormVisible, setParamFormVisible] = useState(false);
  const [paramFormTitle, setParamFormTitle] = useState('新增参数');
  const [editingParamId, setEditingParamId] = useState<string | null>(null);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiSceneGenResult | null>(null);
  const [aiInterface, setAiInterface] = useState<InterfaceType | null>(null);
  const [selectedAiScenarioKeys, setSelectedAiScenarioKeys] = useState<React.Key[]>([]);

  const runAiSceneSuggestion = async (record: InterfaceType) => {
    setAiInterface(record);
    setAiModalOpen(true);
    setAiError(null);
    setAiResult(null);
    setSelectedAiScenarioKeys([]);
    setAiLoading(true);

    const paramsForAi = params.filter((p) => p.interfaceId === record.id).map((p) => ({
      identifier: p.identifier,
      name: p.name,
      paramIn: p.paramIn,
      required: p.required,
      type: p.type,
      path: p.path,
      defaultValue: p.defaultValue,
      remark: p.remark,
    }));

    const resp = await postJson<AiSceneGenResult>('/api/ai/interface-testing/scene-generation/', {
      goal: '基于该接口生成测试场景建议清单（正常/边界/异常/鉴权/幂等）。',
      interfaceName: record.name_cn || record.name,
      method: record.method,
      path: record.path,
      params: paramsForAi,
      context: `项目：${record.projectName}；协议：${record.protocol}；状态：${record.status}`,
    });

    setAiLoading(false);
    if ('error' in resp) {
      setAiError(resp.error.message);
      return;
    }
    setAiResult(resp.result);
  };

  const handleBatchAddScenes = () => {
    if (!aiResult || !aiInterface) return;
    
    const selectedScenarios = aiResult.scenarios.filter(s => 
      selectedAiScenarioKeys.includes(`${s.category}-${s.name}`)
    );

    if (selectedScenarios.length === 0) {
      message.warning('请选择要新增的场景');
      return;
    }

    // Find or create message
    const { messages } = messageStore.getSnapshot();
    let targetMessageId = '';
    let targetMessageName = '';

    const existingMessage = messages.find((m: MessageType) => m.interfaceId === aiInterface.id && m.status === 'active');
    
    if (existingMessage) {
        targetMessageId = existingMessage.id;
        targetMessageName = existingMessage.name;
    } else {
        const newMessage = messageStore.createMessage({
            name: `${aiInterface.name}_DefaultMessage`,
            type: 'JSON',
            interfaceId: aiInterface.id,
            interfaceName: aiInterface.name_cn || aiInterface.name,
            status: 'active',
            sceneCount: 0,
            projectId: aiInterface.projectId,
            projectName: aiInterface.projectName,
            createNormalScene: true,
        });
        targetMessageId = newMessage.id;
        targetMessageName = newMessage.name;
    }

    // Create scenes
    selectedScenarios.forEach(scenario => {
        sceneStore.createScene({
            name: scenario.name,
            messageId: targetMessageId,
            messageName: targetMessageName,
            interfaceId: aiInterface.id,
            interfaceName: aiInterface.name_cn || aiInterface.name,
            status: 'active',
            testDataCount: 0,
            validationRuleCount: 0,
            projectId: aiInterface.projectId,
            projectName: aiInterface.projectName,
            environmentIds: [],
            requestPath: aiInterface.path,
            remark: `AI生成 (${scenario.category}): ${scenario.notes || ''}`,
            returnExample: scenario.requestExample,
        });
    });

    message.success(`成功新增 ${selectedScenarios.length} 个场景`);
    setSelectedAiScenarioKeys([]);
  };

  // 搜索处理
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const name = values.name?.toLowerCase();
    
    if (!name) {
      setData(initialData);
      return;
    }

    const filtered = initialData.filter(item => 
      item.name.toLowerCase().includes(name) || 
      item.name_cn.toLowerCase().includes(name)
    );
    setData(filtered);
    message.success('查询成功');
  };

  const handleReset = () => {
    searchForm.resetFields();
    setData(initialData);
  };

  // 接口新增/编辑处理
  const handleAdd = () => {
    setModalTitle('新增');
    setEditingId(null);
    form.resetFields();
    // 默认值
    form.setFieldsValue({
      status: 'active',
      method: 'GET',
      protocol: 'HTTP',
      type: 'REST',
      contentType: 'application/json',
      queryParams: [],
      bodyParams: [],
      headerParams: [],
      pathParams: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: InterfaceType) => {
    setModalTitle('修改');
    setEditingId(record.id);
    // 获取关联参数
    const interfaceParams = params.filter(p => p.interfaceId === record.id);
    form.setFieldsValue({
      ...record,
      queryParams: interfaceParams.filter(p => p.paramIn === 'query'),
      bodyParams: interfaceParams.filter(p => p.paramIn === 'body'),
      headerParams: interfaceParams.filter(p => p.paramIn === 'header'),
      pathParams: interfaceParams.filter(p => p.paramIn === 'path'),
    });
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
        setData(prev => prev.filter(item => !selectedRowKeys.includes(item.key)));
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      setTimeout(() => {
        const { queryParams, bodyParams, headerParams, pathParams, ...interfaceValues } = values;
        
        // 合并参数
        const formParams = [
            ...(queryParams || []).map((p: any) => ({ ...p, paramIn: 'query' })),
            ...(bodyParams || []).map((p: any) => ({ ...p, paramIn: 'body' })),
            ...(headerParams || []).map((p: any) => ({ ...p, paramIn: 'header' })),
            ...(pathParams || []).map((p: any) => ({ ...p, paramIn: 'path' })),
        ];

        // 获取项目名称
        const project = mockProjects.find(p => p.value === interfaceValues.projectId);
        const projectName = project ? project.label : '';
        
        // 确定接口ID
        let targetInterfaceId = editingId;
        if (!targetInterfaceId) {
          targetInterfaceId = String(Math.max(...data.map(d => Number(d.id)), 0) + 1);
        }

        // 更新参数列表
        let newParamsList = [...params];
        // 如果是编辑，先移除该接口旧的参数（全量替换）
        if (editingId) {
          newParamsList = newParamsList.filter(p => p.interfaceId !== editingId);
        }
        
        // 添加表单中的参数
        const newInterfaceParamsCount = formParams ? formParams.length : 0;
        if (formParams && Array.isArray(formParams)) {
           const addedParams = formParams.map((p: any, index: number) => ({
             ...p,
             id: p.id || `new-${Date.now()}-${index}`,
             interfaceId: targetInterfaceId,
             required: p.required ?? false,
             // 确保有 identifier, 如果没有则自动生成或使用 name
             identifier: p.identifier || p.name || `param${index}`, 
           }));
           newParamsList = [...newParamsList, ...addedParams];
        }
        setParams(newParamsList);

        if (editingId) {
          setData((prev) =>
            prev.map((item) =>
              item.id === editingId
                ? { ...item, ...interfaceValues, projectName, parameterCount: newInterfaceParamsCount }
                : item
            )
          );
          message.success('修改成功');
        } else {
          const newItem: InterfaceType = {
            id: targetInterfaceId!,
            key: targetInterfaceId!,
            ...interfaceValues,
            projectName,
            parameterCount: newInterfaceParamsCount,
          };
          setData((prev) => [newItem, ...prev]);
          message.success('新增成功');
        }
        setLoading(false);
        setIsModalOpen(false);
      }, 500);
    });
  };

  // 导入导出处理
  const handleImport = () => {
    importForm.resetFields();
    setIsImportModalOpen(true);
  };

  const handleExport = () => {
    message.loading('正在导出数据...', 1)
      .then(() => message.success('导出成功'));
  };

  const handleImportOk = () => {
    importForm.validateFields().then(() => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsImportModalOpen(false);
        message.success('导入成功（模拟）');
      }, 1000);
    });
  };

  const downloadTemplate = () => {
    message.success('模板下载成功');
  };

  // 参数管理逻辑
  const openParamModal = (record: InterfaceType) => {
    setCurrentInterface(record);
    // 筛选当前接口的参数
    const filteredParams = params.filter(p => p.interfaceId === record.id);
    setCurrentParams(filteredParams);
    setParamModalVisible(true);
  };

  // 获取参数类型选项
  const getParamTypeOptions = () => [
    { label: 'String', value: 'String' },
    { label: 'Integer', value: 'Integer' },
    { label: 'Float', value: 'Float' },
    { label: 'Boolean', value: 'Boolean' },
    { label: 'Datetime', value: 'Datetime' },
    { label: 'Object', value: 'Object' },
    { label: 'Array', value: 'Array' },
    { label: 'File', value: 'File' },
  ];

  // Content-Type 选项
  const contentTypeOptions = [
    {
      label: 'Text',
      options: [
        { label: 'application/json', value: 'application/json' },
        { label: 'application/ld+json', value: 'application/ld+json' },
        { label: 'application/hal+json', value: 'application/hal+json' },
        { label: 'application/vnd.api+json', value: 'application/vnd.api+json' },
        { label: 'application/xml', value: 'application/xml' },
        { label: 'text/xml', value: 'text/xml' },
      ],
    },
    {
      label: 'Structured',
      options: [
        { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' },
        { label: 'multipart/form-data', value: 'multipart/form-data' },
      ],
    },
    {
      label: 'Binary',
      options: [
        { label: 'application/octet-stream', value: 'application/octet-stream' },
      ],
    },
    {
      label: 'Others',
      options: [
        { label: 'text/html', value: 'text/html' },
        { label: 'text/plain', value: 'text/plain' },
      ],
    },
  ];

  // 获取动态参数位置选项
  const getParamInOptions = (method?: string) => {
    const options = [
      { label: '路径参数 (Path)', value: 'path' },
      { label: 'Query 参数', value: 'query' },
      { label: '请求头 (Header)', value: 'header' },
    ];
    
    // POST/PUT 支持 Body 参数
    if (method === 'POST' || method === 'PUT') {
      options.push({ label: '请求体 (Body)', value: 'body' });
    }
    
    return options;
  };

  const handleAddParam = () => {
    setParamFormTitle('新增参数');
    setEditingParamId(null);
    paramForm.resetFields();
    
    // 设置默认值
    const method = currentInterface?.method;
    const defaultIn = (method === 'POST' || method === 'PUT') ? 'body' : 'path';
    
    paramForm.setFieldsValue({
      required: true,
      paramIn: defaultIn
    });
    
    setParamFormVisible(true);
  };

  const handleEditParam = (record: InterfaceParamType) => {
    setParamFormTitle('修改参数');
    setEditingParamId(record.id);
    paramForm.setFieldsValue(record);
    setParamFormVisible(true);
  };

  const handleDeleteParam = (id: string) => {
    Modal.confirm({
      title: '提示',
      content: '确定要删除该参数吗？',
      onOk: () => {
        const newParams = params.filter(p => p.id !== id);
        setParams(newParams);
        // 更新当前显示列表
        if (currentInterface) {
          setCurrentParams(newParams.filter(p => p.interfaceId === currentInterface.id));
          // 更新接口参数计数
          setData(prev => prev.map(item => 
            item.id === currentInterface.id 
              ? { ...item, parameterCount: newParams.filter(p => p.interfaceId === currentInterface.id).length } 
              : item
          ));
        }
        message.success('删除成功');
      }
    });
  };

  const handleBatchDeleteParams = () => {
    if (selectedParamKeys.length === 0) {
      message.warning('请选择要删除的参数');
      return;
    }
    Modal.confirm({
      title: '提示',
      content: `确定对[id=${selectedParamKeys.join(',')}]进行[批量删除]操作?`,
      onOk: () => {
        const newParams = params.filter(p => !selectedParamKeys.includes(p.id));
        setParams(newParams);
        if (currentInterface) {
           setCurrentParams(newParams.filter(p => p.interfaceId === currentInterface.id));
           // 更新接口参数计数
           setData(prev => prev.map(item => 
             item.id === currentInterface.id 
               ? { ...item, parameterCount: newParams.filter(p => p.interfaceId === currentInterface.id).length } 
               : item
           ));
        }
        setSelectedParamKeys([]);
        message.success('批量删除成功');
      }
    });
  };

  const handleParamFormOk = () => {
    paramForm.validateFields().then((values) => {
      if (!currentInterface) return;

      let newParams = [...params];
      
      if (editingParamId) {
        newParams = newParams.map(p => 
          p.id === editingParamId ? { ...p, ...values } : p
        );
        message.success('修改成功');
      } else {
        const newId = String(Math.max(...params.map(p => Number(p.id)), 0) + 1);
        const newParam: InterfaceParamType = {
          id: newId,
          interfaceId: currentInterface.id,
          ...values,
        };
        newParams.push(newParam);
        message.success('新增成功');
      }

      setParams(newParams);
      setCurrentParams(newParams.filter(p => p.interfaceId === currentInterface.id));
      
      // 更新接口参数计数
      setData(prev => prev.map(item => 
        item.id === currentInterface.id 
          ? { ...item, parameterCount: newParams.filter(p => p.interfaceId === currentInterface.id).length } 
          : item
      ));

      setParamFormVisible(false);
    });
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error('只能上传 Excel 文件!');
      }
      return false; // 阻止自动上传
    },
  };

  const columns: ColumnsType<InterfaceType> = [
    {
      title: '接口ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => Number(a.id) - Number(b.id),
    },
    {
      title: '接口英文名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
    },
    {
      title: '接口中文名',
      dataIndex: 'name_cn',
      key: 'name_cn',
      width: 150,
      ellipsis: true,
    },
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      align: 'center',
      render: (method: string) => (
        <Tag color={methodColorMap[method] || 'default'}>
          {method}
        </Tag>
      ),
    },
    {
      title: '请求路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
      ellipsis: true,
    },
    {
      title: '接口协议',
      dataIndex: 'protocol',
      key: 'protocol',
      width: 100,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status) => (
        <Tag color={status === 'active' ? 'blue' : 'default'}>
          {status === 'active' ? '有效' : '无效'}
        </Tag>
      ),
    },
    {
      title: '接口参数',
      dataIndex: 'parameterCount',
      key: 'parameterCount',
      width: 90,
      align: 'center',
      render: (count, record) => (
        <Tag 
          color="blue" 
          style={{ cursor: 'pointer' }}
          onClick={() => openParamModal(record)}
        >
          {count}
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
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => runAiSceneSuggestion(record)}
            style={{ padding: 0 }}
          >
            AI建议
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
            title="确定删除该接口吗？"
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

  const paramColumns: ColumnsType<InterfaceParamType> = [
    {
      title: '标识',
      dataIndex: 'identifier',
      key: 'identifier',
      width: 120,
      sorter: (a, b) => a.identifier.localeCompare(b.identifier),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '位置',
      dataIndex: 'paramIn',
      key: 'paramIn',
      width: 100,
      render: (val) => {
        const map: Record<string, string> = {
          path: '路径参数',
          body: '请求体',
        };
        return <Tag>{map[val] || val}</Tag>;
      }
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (val) => val ? <Tag color="red">必填</Tag> : <Tag>选填</Tag>
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 100,
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
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
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleEditParam(record)}
            style={{ padding: 0 }}
          >
            修改
          </Button>
          <Button
            type="link"
            danger
            size="small"
            onClick={() => handleDeleteParam(record.id)}
            style={{ padding: 0 }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="接口管理">
      <div className="p-4">
        {/* 搜索区域 */}
        <Card bordered={false} style={{ marginBottom: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="name" label="接口英文名">
              <Input placeholder="请输入接口英文名" allowClear style={{ width: 200 }} />
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
              <Button type="primary" onClick={handleImport}>
                导入
              </Button>
              <Button onClick={handleExport}>
                导出
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
            scroll={{ x: 1400 }}
            size="middle"
          />
        </Card>

        {/* 新增/编辑接口弹窗 */}
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
              name="name"
              label="接口名称"
              rules={[{ required: true, message: '请输入接口名称' }]}
            >
              <Input placeholder="接口名称" />
            </Form.Item>

            <Form.Item
              name="name_cn"
              label="中文名称"
              rules={[{ required: true, message: '请输入中文名称' }]}
            >
              <Input placeholder="中文名称" />
            </Form.Item>

            <Form.Item
              name="type"
              label="接口类型"
              rules={[{ required: true, message: '请选择接口类型' }]}
              initialValue="REST"
            >
               <Radio.Group>
                  <Radio value="REST">REST</Radio>
                  <Radio value="GraphQL">GraphQL</Radio>
                  <Radio value="Realtime">Realtime</Radio>
               </Radio.Group>
            </Form.Item>

            <Form.Item
              name="method"
              label="请求方法"
              rules={[{ required: true, message: '请选择请求方法' }]}
            >
              <Select placeholder="选择" options={
                  interfaceType === 'Realtime' 
                  ? [
                      { label: 'WebSocket', value: 'WebSocket' },
                      { label: 'SSE', value: 'SSE' },
                      { label: 'Socket.IO', value: 'Socket.IO' },
                      { label: 'MQTT', value: 'MQTT' },
                    ]
                  : interfaceType === 'GraphQL'
                    ? [
                        { label: 'POST', value: 'POST' },
                      ]
                    : [
                        { label: 'GET', value: 'GET' },
                        { label: 'POST', value: 'POST' },
                        { label: 'PUT', value: 'PUT' },
                        { label: 'DELETE', value: 'DELETE' },
                      ]
              } />
            </Form.Item>

            <Form.Item
              name="path"
              label="请求路径"
              rules={[{ required: true, message: '请输入请求路径' }]}
            >
              <Input placeholder="请求路径" />
            </Form.Item>

            <Form.Item
              name="protocol"
              label="接口协议"
              rules={[{ required: true, message: '请选择接口协议' }]}
            >
               <Radio.Group>
                  <Radio value="HTTP">HTTP</Radio>
                  <Radio value="HTTPS">HTTPS</Radio>
               </Radio.Group>
            </Form.Item>

            <Form.Item
              name="status"
              label="接口状态"
              initialValue="active"
              rules={[{ required: true, message: '请选择接口状态' }]}
            >
              <Select placeholder="选择" options={[
                { label: '有效', value: 'active' },
                { label: '无效', value: 'inactive' },
              ]} />
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="备注" rows={3} />
            </Form.Item>

            <div style={{ marginTop: 24 }}>
                <Tabs type="card" items={[
                    {
                        key: 'query',
                        label: 'Query Parameters',
                        children: (
                            <Form.List name="queryParams">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                <Form.Item {...restField} name={[name, 'identifier']} rules={[{ required: true, message: '必填' }]} noStyle>
                                                    <Input placeholder="Key" style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'name']} noStyle>
                                                    <Input placeholder="中文名" style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'required']} valuePropName="checked" noStyle initialValue={true}>
                                                    <Switch size="small" checkedChildren="必" unCheckedChildren="选" />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'remark']} noStyle>
                                                    <Input placeholder="备注" style={{ width: 150 }} />
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            </Space>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                添加 Query 参数
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        )
                    },
                    (method === 'POST' || method === 'PUT') ? {
                        key: 'body',
                        label: 'Body (Form)',
                        children: (
                            <>
                                <Form.Item
                                  name="contentType"
                                  label="Content-Type"
                                  labelCol={{ span: 5 }}
                                  wrapperCol={{ span: 19 }}
                                  style={{ marginBottom: 12 }}
                                >
                                  <Select 
                                    placeholder="Select Content-Type" 
                                    options={contentTypeOptions} 
                                    showSearch
                                    allowClear
                                  />
                                </Form.Item>
                                <Form.List name="bodyParams">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                <Form.Item {...restField} name={[name, 'identifier']} rules={[{ required: true, message: '必填' }]} noStyle>
                                                    <Input placeholder="Key" style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'type']} initialValue="String" noStyle>
                                                    <Select style={{ width: 100 }} options={getParamTypeOptions()} />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'required']} valuePropName="checked" noStyle initialValue={true}>
                                                    <Switch size="small" checkedChildren="必" unCheckedChildren="选" />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'remark']} noStyle>
                                                    <Input placeholder="备注" style={{ width: 150 }} />
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            </Space>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                添加 Body 参数
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                            </>
                        )
                    } : null,
                    {
                        key: 'header',
                        label: 'Headers',
                        children: (
                            <Form.List name="headerParams">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                <Form.Item {...restField} name={[name, 'identifier']} rules={[{ required: true, message: '必填' }]} noStyle>
                                                    <Input placeholder="Key" style={{ width: 120 }} />
                                                </Form.Item>
                                                <Form.Item {...restField} name={[name, 'defaultValue']} noStyle>
                                                    <Input placeholder="Value" style={{ width: 120 }} />
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => remove(name)} />
                                            </Space>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                添加 Header
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        )
                    }
                ].filter(Boolean) as any} />
            </div>
          </Form>
        </Modal>

        {/* 导入弹窗 */}
        <Modal
          title="批量导入"
          open={isImportModalOpen}
          onOk={handleImportOk}
          onCancel={() => setIsImportModalOpen(false)}
          width={600}
        >
          <Form form={importForm} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            <Form.Item label=" ">
               <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={downloadTemplate}>
                 模板下载
               </Button>
            </Form.Item>

            <Form.Item
              name="projectId"
              label="所属项目"
              rules={[{ required: true, message: '请选择所属项目' }]}
            >
              <Select placeholder="点击选择项目" options={mockProjects} />
            </Form.Item>

            <Form.Item
              name="file"
              label="接口文件"
              valuePropName="fileList"
              getValueFromEvent={(e: { fileList: UploadFile[] } | UploadFile[]) => {
                if (Array.isArray(e)) return e;
                return e?.fileList;
              }}
              rules={[{ required: true, message: '请上传文件' }]}
            >
              <Upload {...uploadProps}>
                <Button type="primary" icon={<UploadOutlined />}>上传文件</Button>
                <span style={{ marginLeft: 10, color: '#999' }}>只能上传xlsx格式的文件</span>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* 参数管理弹窗 */}
        <Modal
          title={`接口${currentInterface?.name || ''}的参数`}
          open={paramModalVisible}
          onCancel={() => setParamModalVisible(false)}
          footer={null}
          width={1000}
        >
          <div style={{ marginBottom: 16 }}>
             <Space>
               <Button type="primary" icon={<PlusOutlined />} onClick={handleAddParam}>
                 新增
               </Button>
               <Button danger icon={<DeleteOutlined />} onClick={handleBatchDeleteParams}>
                 批量删除
               </Button>
             </Space>
          </div>
          <Table
            columns={paramColumns}
            dataSource={currentParams}
            rowKey="id"
            pagination={{
              defaultPageSize: 10,
              showTotal: (total) => `共 ${total} 条`,
            }}
            rowSelection={{
              selectedRowKeys: selectedParamKeys,
              onChange: setSelectedParamKeys,
            }}
            size="small"
          />
        </Modal>

        {/* 新增/编辑参数弹窗 (内层) */}
        <Modal
          title={paramFormTitle}
          open={paramFormVisible}
          onOk={handleParamFormOk}
          onCancel={() => setParamFormVisible(false)}
          width={500}
          zIndex={1001} // 确保在参数列表弹窗之上
        >
          <Form form={paramForm} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }}>
            <Form.Item
              name="identifier"
              label="标识"
              rules={[{ required: true, message: '请输入标识' }]}
            >
              <Input placeholder="例如 userKey" />
            </Form.Item>
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input placeholder="例如 用户Key" />
            </Form.Item>
            
            <Form.Item
              name="paramIn"
              label="参数位置"
              rules={[{ required: true, message: '请选择参数位置' }]}
            >
               <Select placeholder="选择位置" options={getParamInOptions(currentInterface?.method)} />
            </Form.Item>

            <Form.Item name="required" label="是否必填" valuePropName="checked">
              <Switch checkedChildren="必填" unCheckedChildren="选填" />
            </Form.Item>

            <Form.Item name="defaultValue" label="默认值">
              <Input placeholder="默认值" />
            </Form.Item>
            <Form.Item name="path" label="路径">
              <Input placeholder="例如 TopRoot (Body内路径)" />
            </Form.Item>
            <Form.Item name="type" label="类型">
               <Select placeholder="选择类型" options={getParamTypeOptions()} />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="备注" rows={2} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: 24 }}>
                <span>AI 场景建议 - {aiInterface?.name_cn || aiInterface?.name || ''}</span>
                {aiResult && (
                    <Button 
                        type="primary" 
                        size="small" 
                        onClick={handleBatchAddScenes}
                        disabled={selectedAiScenarioKeys.length === 0}
                    >
                        新增场景 ({selectedAiScenarioKeys.length})
                    </Button>
                )}
            </div>
          }
          open={aiModalOpen}
          onCancel={() => setAiModalOpen(false)}
          footer={null}
          width={1100}
        >
          {aiLoading ? <Alert type="info" message="AI 正在生成，请稍候..." showIcon /> : null}
          {aiError ? <Alert type="error" message={aiError} showIcon style={{ marginTop: 12 }} /> : null}
          {aiResult ? (
            <>
              <div style={{ marginTop: 12, marginBottom: 12 }}>{aiResult.summary}</div>
              <Table<AiScenario>
                rowKey={(r) => `${r.category}-${r.name}`}
                rowSelection={{
                    selectedRowKeys: selectedAiScenarioKeys,
                    onChange: setSelectedAiScenarioKeys,
                }}
                columns={[
                  { title: '场景名称', dataIndex: 'name', width: 240, ellipsis: true },
                  { title: '类别', dataIndex: 'category', width: 120 },
                  { title: '请求示例', dataIndex: 'requestExample', ellipsis: true },
                  {
                    title: '断言建议',
                    dataIndex: 'assertions',
                    render: (v: string[] | undefined) => (v?.length ? v.join('；') : '-'),
                    ellipsis: true,
                  },
                  { title: '备注', dataIndex: 'notes', ellipsis: true },
                ]}
                dataSource={aiResult.scenarios}
                pagination={{ pageSize: 8 }}
              />
            </>
          ) : null}
        </Modal>
      </div>
    </MainLayout>
  );
}
