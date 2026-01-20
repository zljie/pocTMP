'use client';

import React, { useState, useSyncExternalStore, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Form,
  Modal,
  Select,
  Radio,
  Tag,
  message,
  Popconfirm,
  InputNumber,
  Switch,
  Divider,
  Typography,
  Tabs,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';
import combinationSceneStore, {
  CombinationSceneType,
  IncludedScene,
  SceneConfig,
} from '@/stores/combinationSceneStore';
import sceneStore, { SceneType, SceneTestData, ValidationRule } from '@/stores/sceneStore';
import apiTestEnvironmentStore from '@/stores/apiTestEnvironmentStore';

const { Text } = Typography;

// --- Types & Constants ---

const PROJECT_OPTIONS = [
  { label: '基础资料平台(mdm)', value: 'p1' },
  { label: '示例项目B', value: 'p2' },
];

// --- Sub-Component: Scene Selection Modal ---

interface SceneSelectionModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (scenes: SceneType[]) => void;
}

const SceneSelectionModal: React.FC<SceneSelectionModalProps> = ({
  open,
  onCancel,
  onSelect,
}) => {
  const scenes = useSyncExternalStore(sceneStore.subscribe, sceneStore.getSnapshot).scenes;
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<SceneType[]>([]);

  const columns = [
    { title: '场景ID', dataIndex: 'id', width: 80 },
    { title: '场景名称', dataIndex: 'name' },
    { title: '接口名称', dataIndex: 'interfaceName' },
    { title: '所属项目', dataIndex: 'projectName' },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
  ];

  const filteredScenes = scenes.filter((s) =>
    s.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedScenes.length === 0) {
      message.warning('请至少选择一个场景');
      return;
    }
    onSelect(selectedScenes);
    setSelectedRowKeys([]);
    setSelectedScenes([]);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: SceneType[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedScenes(newSelectedRows);
  };

  return (
    <Modal
      title="选择场景"
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          选择确认
        </Button>,
      ]}
    >
      <div className="mb-4 flex justify-between">
         <Space>
            <Text type="secondary">已选择 {selectedScenes.length} 个场景</Text>
         </Space>
        <Input.Search
          placeholder="搜索场景名称"
          onSearch={setSearchText}
          style={{ width: 300 }}
          allowClear
        />
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredScenes}
        pagination={{ pageSize: 10 }}
        size="small"
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

// --- Sub-Component: Scene Order Modal ---

interface SceneOrderModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (orderedIds: string[]) => void;
  scenes: IncludedScene[];
}

const SceneOrderModal: React.FC<SceneOrderModalProps> = ({
  open,
  onCancel,
  onSave,
  scenes,
}) => {
  const [orderedScenes, setOrderedScenes] = useState<IncludedScene[]>([]);

  useEffect(() => {
    if (open) {
      setOrderedScenes([...scenes].sort((a, b) => a.executeOrder - b.executeOrder));
    }
  }, [open, scenes]);

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const newScenes = [...orderedScenes];
    if (direction === 'up' && index > 0) {
      [newScenes[index], newScenes[index - 1]] = [newScenes[index - 1], newScenes[index]];
    } else if (direction === 'down' && index < newScenes.length - 1) {
      [newScenes[index], newScenes[index + 1]] = [newScenes[index + 1], newScenes[index]];
    }
    setOrderedScenes(newScenes);
  };

  const handleSave = () => {
    onSave(orderedScenes.map((s) => s.id));
  };

  const columns = [
    {
      title: '执行顺序',
      key: 'index',
      width: 80,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    { title: '场景名称', dataIndex: 'sceneName' },
    { title: '接口名称', dataIndex: 'interfaceName' },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, __: any, index: number) => (
        <Space>
          <Button
            type="text"
            icon={<ArrowUpOutlined />}
            disabled={index === 0}
            onClick={() => moveRow(index, 'up')}
          >
            上移
          </Button>
          <Button
            type="text"
            icon={<ArrowDownOutlined />}
            disabled={index === orderedScenes.length - 1}
            onClick={() => moveRow(index, 'down')}
          >
            下移
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="组合场景中场景执行顺序调整"
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      width={800}
      okText="调整确认"
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orderedScenes}
        pagination={false}
        size="small"
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

// --- Sub-Component: Test Data View Modal ---

interface TestDataViewModalProps {
  open: boolean;
  onCancel: () => void;
  sceneId: string;
  sceneName: string;
}

const TestDataViewModal: React.FC<TestDataViewModalProps> = ({
  open,
  onCancel,
  sceneId,
  sceneName,
}) => {
  const scenes = useSyncExternalStore(sceneStore.subscribe, sceneStore.getSnapshot).scenes;
  const scene = scenes.find(s => s.id === sceneId);
  const testData = scene?.testDataList || [];

  const columns = [
    { title: '序号', key: 'index', render: (_: any, __: any, index: number) => index + 1, width: 60 },
    { title: '测试数据ID', dataIndex: 'id', width: 100 },
    { title: '测试数据', dataIndex: 'content', ellipsis: true },
    { title: '描述', dataIndex: 'mark' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      width: 80,
      render: (val: string) => <Tag color="blue">{val === 'active' ? '有效' : '无效'}</Tag>
    },
    { 
      title: '默认数据', 
      dataIndex: 'isDefault', 
      width: 100,
      render: (val: boolean) => val ? <Tag color="green">是</Tag> : <Tag>否</Tag>
    },
  ];

  return (
    <Modal
      title={`${sceneName} 的测试数据`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={testData}
        pagination={{ pageSize: 5 }}
        size="small"
      />
    </Modal>
  );
};

// --- Sub-Component: Validation Rule View Modal ---

interface ValidationRuleViewModalProps {
  open: boolean;
  onCancel: () => void;
  sceneId: string;
  sceneName: string;
}

const ValidationRuleViewModal: React.FC<ValidationRuleViewModalProps> = ({
  open,
  onCancel,
  sceneId,
  sceneName,
}) => {
  const scenes = useSyncExternalStore(sceneStore.subscribe, sceneStore.getSnapshot).scenes;
  const scene = scenes.find(s => s.id === sceneId);
  const rules = scene?.validationRules || [];

  const columns = [
    { title: '序号', key: 'index', render: (_: any, __: any, index: number) => index + 1, width: 60 },
    { title: '验证规则ID', dataIndex: 'id', width: 100 },
    { title: '验证方式', dataIndex: 'type', render: (val: string) => val === 'node' ? '节点验证' : '自定义验证' },
    { title: '节点路径/关联规则', dataIndex: 'pathOrRule', ellipsis: true },
    { title: '预期值类型', dataIndex: 'expectedType', render: (val: string) => val === 'constant' ? '常量' : '变量' },
    { title: '比对条件', dataIndex: 'compareCondition', render: (val: string) => val || '-' },
    { title: '预期值', dataIndex: 'expectedValue', ellipsis: true },
    { 
      title: '状态', 
      dataIndex: 'status', 
      width: 80,
      render: (val: string) => <Tag color="blue">{val === 'active' ? '有效' : '无效'}</Tag>
    },
  ];

  return (
    <Modal
      title={`${sceneName} 的验证规则`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rules}
        pagination={{ pageSize: 5 }}
        size="small"
      />
    </Modal>
  );
};

// --- Sub-Component: Scene Configuration Modal ---

interface SceneConfigModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (config: Partial<SceneConfig>) => void;
  initialConfig: SceneConfig;
  sceneName: string;
}

const SceneConfigModal: React.FC<SceneConfigModalProps> = ({
  open,
  onCancel,
  onSave,
  initialConfig,
  sceneName,
}) => {
  const [form] = Form.useForm();
  const environments = useSyncExternalStore(
    apiTestEnvironmentStore.subscribe,
    apiTestEnvironmentStore.getSnapshot
  );

  // Watch async status to control field visibility/validity
  const isAsync = Form.useWatch('isAsync', form);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialConfig);
    }
  }, [open, initialConfig, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (error) {
      // Validation failed
    }
  };

  return (
    <Modal
      title={`组合场景配置 - ${sceneName}`}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      okText="保存更改"
    >
      <Form form={form} layout="vertical" initialValues={initialConfig}>
        <Tabs
          defaultActiveKey="basic"
          items={[
            {
              key: 'basic',
              label: '基础配置',
              children: (
                <>
                  <Form.Item name="environmentId" label="测试环境">
                    <Select placeholder="默认所有测试环境" allowClear>
                      {environments
                        .filter((e) => e.status === 'active')
                        .map((e) => (
                          <Select.Option key={e.id} value={e.id}>
                            {e.projectName} - {e.systemName}
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>

                  <Form.Item name="retryCount" label="重试次数" initialValue={0}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    name="isAsync"
                    label="异步执行"
                    valuePropName="checked"
                    initialValue={false}
                    extra="设置了异步执行，测试间隔和失败处理都将无效，且无法保存变量。"
                  >
                    <Switch checkedChildren="是" unCheckedChildren="否" />
                  </Form.Item>

                  {!isAsync && (
                    <>
                      <Form.Item
                        name="testInterval"
                        label="测试间隔 (毫秒)"
                        initialValue={1000}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>

                      <Form.Item
                        name="failureHandling"
                        label="失败处理"
                        initialValue="stop"
                      >
                        <Radio.Group>
                          <Radio value="stop">结束测试</Radio>
                          <Radio value="continue">执行下一个场景</Radio>
                          <Radio value="continue_final">执行最后一个场景</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </>
                  )}
                </>
              ),
            },
            {
              key: 'replace',
              label: '替换变量',
              children: (
                <Form.List name="replaceVariables">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space
                          key={key}
                          style={{ display: 'flex', marginBottom: 8 }}
                          align="baseline"
                        >
                          <Form.Item
                            {...restField}
                            name={[name, 'variableName']}
                            rules={[{ required: true, message: '请输入参数名称' }]}
                          >
                            <Input placeholder="要替换的参数名称" style={{width: 150}} />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'targetType']}
                            initialValue="input"
                          >
                            <Select style={{ width: 100 }}>
                              <Select.Option value="input">入参节点</Select.Option>
                              <Select.Option value="header">Headers节点</Select.Option>
                              <Select.Option value="query">Query节点</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'sourceType']}
                            initialValue="context"
                          >
                            <Select style={{ width: 120 }}>
                              <Select.Option value="context">上下文变量</Select.Option>
                              <Select.Option value="template">模版变量</Select.Option>
                              <Select.Option value="global">全局变量</Select.Option>
                              <Select.Option value="constant">常量</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'sourceValue']}
                            rules={[{ required: true, message: '请输入值' }]}
                          >
                            <Input placeholder="变量值/名称" style={{width: 150}} />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Space>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          添加替换变量
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              ),
            },
            {
              key: 'save',
              label: '保存变量',
              disabled: isAsync,
              children: (
                <Form.List name="saveVariables">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space
                          key={key}
                          style={{ display: 'flex', marginBottom: 8 }}
                          align="baseline"
                        >
                          <Form.Item
                            {...restField}
                            name={[name, 'variableName']}
                            rules={[{ required: true, message: '请输入保存的变量名' }]}
                          >
                            <Input placeholder="要保存的变量名" style={{width: 180}} />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'sourceType']}
                            initialValue="output"
                          >
                            <Select style={{ width: 120 }}>
                              <Select.Option value="input">入参节点</Select.Option>
                              <Select.Option value="output">出参节点</Select.Option>
                              <Select.Option value="response_header">Headers节点</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'sourcePath']}
                            rules={[{ required: true, message: '请输入节点路径' }]}
                          >
                            <Input placeholder="节点路径/关联规则" style={{width: 200}} />
                          </Form.Item>
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        </Space>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          添加保存变量
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

// --- Sub-Component: Execution Result Detail Modal ---

interface ExecutionResultDetailModalProps {
  open: boolean;
  onCancel: () => void;
  result: any;
}

const ExecutionResultDetailModal: React.FC<ExecutionResultDetailModalProps> = ({
  open,
  onCancel,
  result,
}) => {
  if (!result) return null;

  return (
    <Modal
      title={`${result.sceneName} 详细测试结果`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>
      ]}
      width={900}
    >
      <div className="space-y-4">
        <div>
          <Text strong>请求地址：</Text>
          <Text>{result.requestUrl || 'http://mock-api.com/path/to/resource'}</Text>
        </div>
        <div>
          <Text strong>测试环境：</Text>
          <Text>{result.environment}</Text>
        </div>
        <div>
          <Text strong>运行标记：</Text>
          <Tag color="orange">异常结束</Tag> {/* Mocked for demo */}
        </div>
        <div>
          <Text strong>耗时：</Text>
          <Text>0ms</Text>
        </div>
        <div>
           <Text strong>头信息：</Text>
           <Input.TextArea 
              readOnly 
              rows={2} 
              value={'{"RequestHeader":{},"ResponseHeader":{}}'} 
              style={{ marginTop: 8 }}
            />
        </div>
        <div>
           <Text strong>代理信息：</Text>
           <Text>{"{\"useProxy\":\"否\"}"}</Text>
        </div>
        <div>
           <Text strong>状态码：</Text>
           <Text>false</Text>
        </div>
        <div>
           <Text strong>测试备注：</Text>
           <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
             组合场景名[{result.combinationName || '未知'}], 执行序号[1] 发送请求出错... 重试次数...1 Connect to ... timed out 发送请求出错... 重试次数...2
           </div>
        </div>
        <div>
           <Text strong>入参：</Text>
           <Input.TextArea readOnly rows={3} value="{}" style={{ marginTop: 8 }} />
        </div>
        <div>
           <Text strong>出参：</Text>
           <Input.TextArea readOnly rows={3} value="{}" style={{ marginTop: 8 }} />
        </div>
      </div>
    </Modal>
  );
};

// --- Sub-Component: Execution Result Modal ---

interface ExecutionResultModalProps {
  open: boolean;
  onCancel: () => void;
  combinationName: string;
  results: any[]; // Mock results
}

const ExecutionResultModal: React.FC<ExecutionResultModalProps> = ({
  open,
  onCancel,
  combinationName,
  results,
}) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);

  const handleViewDetail = (record: any) => {
    setCurrentResult({ ...record, combinationName });
    setDetailOpen(true);
  };

  const columns = [
    { title: '序号', key: 'index', render: (_: any, __: any, index: number) => index + 1, width: 60 },
    { title: '场景ID', dataIndex: 'sceneId', width: 80 },
    { 
      title: '接口->报文->场景', 
      key: 'detail',
      render: (_: any, record: any) => (
        <div style={{ fontSize: 12 }}>
          <div>{record.interfaceName}</div>
          <div style={{ color: '#888' }}>{record.messageName}</div>
          <div style={{ color: '#1890ff' }}>{record.sceneName}</div>
        </div>
      )
    },
    { title: '测试环境', dataIndex: 'environment', width: 120 },
    { 
      title: '执行结果', 
      dataIndex: 'status', 
      width: 100,
      render: (val: string, record: any) => (
        <a onClick={() => handleViewDetail(record)}>
          <Tag color={val === 'pass' ? 'success' : 'error'} style={{ cursor: 'pointer' }}>
            {val === 'pass' ? '通过' : '异常结束'}
          </Tag>
        </a>
      )
    },
  ];

  return (
    <>
      <Modal
        title={`${combinationName} 测试结果`}
        open={open}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>
            关闭
          </Button>
        ]}
        width={900}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={results}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Modal>

      <ExecutionResultDetailModal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        result={currentResult}
      />
    </>
  );
};


// --- Sub-Component: Included Scenes Modal ---

interface IncludedScenesModalProps {
  open: boolean;
  onCancel: () => void;
  combinationId: string;
  combinationName: string;
  includedScenes: IncludedScene[];
}

const IncludedScenesModal: React.FC<IncludedScenesModalProps> = ({
  open,
  onCancel,
  combinationId,
  combinationName,
  includedScenes,
}) => {
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [currentSceneConfig, setCurrentSceneConfig] = useState<{
    id: string;
    config: SceneConfig;
    name: string;
  } | null>(null);

  const [testDataOpen, setTestDataOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [viewingScene, setViewingScene] = useState<{id: string; name: string} | null>(null);

  const handleAddScenes = (scenes: SceneType[]) => {
    const newScenes = scenes.map(s => ({
      sceneId: s.id,
      sceneName: s.name,
      interfaceName: s.interfaceName,
      messageName: s.messageName || '',
      testDataCount: s.testDataList?.length || 0,
      validationRuleCount: s.validationRules?.length || 0,
      requestPath: s.requestPath,
      projectId: s.projectId,
    }));
    
    combinationSceneStore.addIncludedScenes(combinationId, newScenes as any);
    message.success('添加成功');
    setSelectionOpen(false);
  };

  const handleRemove = (id: string) => {
    combinationSceneStore.removeIncludedScene(combinationId, [id]);
    message.success('移除成功');
  };

  const handleConfig = (record: IncludedScene) => {
    setCurrentSceneConfig({
      id: record.id,
      config: record.config,
      name: record.sceneName,
    });
    setConfigOpen(true);
  };

  const handleSaveConfig = (newConfig: Partial<SceneConfig>) => {
    if (currentSceneConfig) {
      combinationSceneStore.updateIncludedSceneConfig(combinationId, currentSceneConfig.id, newConfig);
      message.success('配置更新成功');
      setConfigOpen(false);
    }
  };
  
  const handleSaveOrder = (orderedIds: string[]) => {
      combinationSceneStore.reorderIncludedScenes(combinationId, orderedIds);
      message.success('排序更新成功');
      setOrderOpen(false);
  };

  const columns = [
    { title: '执行顺序', dataIndex: 'executeOrder', width: 80, align: 'center' as const },
    { title: '场景名称', dataIndex: 'sceneName' },
    { title: '接口名称', dataIndex: 'interfaceName' },
    { 
        title: '测试数据', 
        dataIndex: 'testDataCount', 
        width: 100,
        render: (val: number, record: IncludedScene) => (
            <a onClick={() => { setViewingScene({id: record.sceneId, name: record.sceneName}); setTestDataOpen(true); }}>
                {val}
            </a>
        )
    },
    { 
        title: '验证规则', 
        dataIndex: 'validationRuleCount', 
        width: 100,
        render: (val: number, record: IncludedScene) => (
             <a onClick={() => { setViewingScene({id: record.sceneId, name: record.sceneName}); setRuleOpen(true); }}>
                {val}
            </a>
        )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: IncludedScene) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleConfig(record)}>配置</Button>
          <Popconfirm title="确定移除?" onConfirm={() => handleRemove(record.id)}>
            <Button type="link" danger size="small">移除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={`包含的场景 - ${combinationName}`}
        open={open}
        onCancel={onCancel}
        width={1000}
        footer={[<Button key="close" onClick={onCancel}>关闭</Button>]}
      >
        <div className="mb-4">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setSelectionOpen(true)}>
              添加场景
            </Button>
            <Button icon={<ArrowUpOutlined />} onClick={() => setOrderOpen(true)} disabled={includedScenes.length < 2}>
              场景执行顺序
            </Button>
          </Space>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={includedScenes}
          pagination={false}
          size="small"
          scroll={{ y: 500 }}
        />
      </Modal>

      <SceneSelectionModal
        open={selectionOpen}
        onCancel={() => setSelectionOpen(false)}
        onSelect={handleAddScenes}
      />
      
      <SceneOrderModal
        open={orderOpen}
        onCancel={() => setOrderOpen(false)}
        onSave={handleSaveOrder}
        scenes={includedScenes}
      />

      {currentSceneConfig && (
        <SceneConfigModal
          open={configOpen}
          onCancel={() => setConfigOpen(false)}
          onSave={handleSaveConfig}
          initialConfig={currentSceneConfig.config}
          sceneName={currentSceneConfig.name}
        />
      )}
      
      {viewingScene && (
          <>
            <TestDataViewModal 
                open={testDataOpen} 
                onCancel={() => setTestDataOpen(false)} 
                sceneId={viewingScene.id}
                sceneName={viewingScene.name}
            />
            <ValidationRuleViewModal 
                open={ruleOpen} 
                onCancel={() => setRuleOpen(false)} 
                sceneId={viewingScene.id}
                sceneName={viewingScene.name}
            />
          </>
      )}
    </>
  );
};

// --- Main Page Component ---

export default function CombinationScenePage() {
  const scenes = useSyncExternalStore(
    combinationSceneStore.subscribe,
    combinationSceneStore.getSnapshot
  );

  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // Included Scenes Modal State
  const [includedModalOpen, setIncludedModalOpen] = useState(false);
  const [currentCombination, setCurrentCombination] = useState<{
    id: string;
    name: string;
    scenes: IncludedScene[];
  } | null>(null);

  // Execution
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [executingCombination, setExecutingCombination] = useState<string>('');

  // Search
  const [searchText, setSearchText] = useState('');
  
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchText(values.name || '');
  };

  const filteredData = scenes.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // CRUD
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    // Set default values
    form.setFieldsValue({
      status: 'active',
      successCondition: 'single_stats',
      executionMode: 'independent',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: CombinationSceneType) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: `确认对[id=${id}]进行[删除]操作?`,
      onOk: () => {
        try {
          combinationSceneStore.remove(id);
          message.success('删除成功');
        } catch (error: any) {
          message.error(error.message);
        }
      },
    });
  };

  const handleCopy = (id: string) => {
    Modal.confirm({
      title: '提示',
      content: '确认复制该组合场景吗？',
      onOk: () => {
        try {
          combinationSceneStore.copy(id);
          message.success('复制成功');
        } catch (error: any) {
          message.error(error.message);
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return;
    
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: `确定对[id=${selectedRowKeys.join(',')}]进行[批量删除]操作?`,
      onOk: () => {
        const result = combinationSceneStore.removeBatch(selectedRowKeys as string[]);
        
        if (result.failedIds.length > 0) {
          message.warning(
            `ID=${result.failedIds.join(', ')} 的组合场景被测试集引用，不可被删除！其余组合场景已被删除`
          );
        } else {
          message.success('批量删除成功');
        }
        setSelectedRowKeys([]);
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        combinationSceneStore.update(editingId, values);
        message.success('更新成功');
      } else {
        combinationSceneStore.create(values);
        message.success('创建成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      // Validation error
    }
  };

  // Open Included Scenes
  const handleOpenIncludedScenes = (record: CombinationSceneType) => {
    setCurrentCombination({
      id: record.id,
      name: record.name,
      scenes: record.includedScenes,
    });
    setIncludedModalOpen(true);
  };

  // Execution Mock
  const handleRun = (record: CombinationSceneType) => {
    if (record.status !== 'active') {
      message.warning('无效的组合场景无法运行');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: (
        <div>
          <p>确认测试该组合场景吗？</p>
          <p>组合场景的测试时长度和包含的场景个数有关，请耐心等待测试完成</p>
        </div>
      ),
      onOk: () => {
        const key = 'run_combination';
        message.loading({ content: `正在执行组合场景: ${record.name}...`, key });
        
        // Mock Execution Logic
        setTimeout(() => {
          message.success({ content: '执行完成', key });
          
          // Generate Mock Results
          // Logic: For each included scene, if env is not set, default to 'all'.
          // Mocking "run for each test data in each environment"
          const results = record.includedScenes.flatMap((scene, idx) => {
            // Mock environment expansion: if no env configured, assume 1 default env.
            // In real logic, we'd look up available envs for the scene.
            return [
              {
                id: `res_${scene.id}_1`,
                sceneId: scene.sceneId,
                sceneName: scene.sceneName,
                interfaceName: scene.interfaceName,
                messageName: scene.messageName,
                environment: '其他',
                status: Math.random() > 0.2 ? 'pass' : 'fail',
              }
            ];
          });

          setExecutionResults(results);
          setExecutingCombination(record.name);
          setResultModalOpen(true);
        }, 2000);
      }
    });
  };

  const columns = [
    {
      title: '组合场景ID',
      dataIndex: 'id',
      width: 100,
    },
    {
      title: '组合场景名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '包含的场景',
      dataIndex: 'includedScenes',
      width: 120,
      align: 'center' as const,
      render: (scenes: IncludedScene[], record: CombinationSceneType) => (
        <a onClick={() => handleOpenIncludedScenes(record)}>
          <Tag color="geekblue" style={{ cursor: 'pointer' }}>
            {scenes.length}
          </Tag>
        </a>
      ),
    },
    {
      title: '成功条件',
      dataIndex: 'successCondition',
      width: 150,
      render: (val: string) =>
        val === 'all_pass' ? '全部场景测试通过' : '单独统计各场景测试结果',
    },
    {
      title: '运行方式',
      dataIndex: 'executionMode',
      width: 150,
      render: (val: string) =>
        val === 'independent' ? '使用独立客户端' : '使用共享客户端',
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '有效' : '无效'}
        </Tag>
      ),
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 260,
      render: (_: any, record: CombinationSceneType) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRun(record)}
            disabled={record.status !== 'active'}
          >
            运行
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            修改
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record.id)}
          >
            复制
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="组合场景管理">
      <div className="p-4">
        {/* Search Area */}
        <Card bordered={false} style={{ marginBottom: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="name" label="组合场景名">
              <Input
                placeholder="请输入组合场景名"
                style={{ width: 200 }}
                allowClear
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                查询
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Table Area */}
        <Card bordered={false} styles={{ body: { padding: '16px 24px 24px' } }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增
              </Button>
              <Button 
                danger 
                disabled={selectedRowKeys.length === 0} 
                onClick={handleBatchDelete}
              >
                批量删除
              </Button>
            </Space>
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1300 }}
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={editingId ? '修改组合场景' : '新增组合场景'}
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={() => setIsModalOpen(false)}
          width={700}
        >
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item
              name="projectId"
              label="所属项目"
              rules={[{ required: true, message: '请选择所属项目' }]}
            >
              <Select placeholder="点击选择项目">
                {PROJECT_OPTIONS.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {/* Hidden field to sync project name */}
            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) => prev.projectId !== curr.projectId}
            >
              {({ getFieldValue, setFieldsValue }) => {
                const pid = getFieldValue('projectId');
                const pname = PROJECT_OPTIONS.find((p) => p.value === pid)?.label;
                if (pname) {
                  setFieldsValue({ projectName: pname });
                }
                return (
                  <Form.Item name="projectName" hidden>
                    <Input />
                  </Form.Item>
                );
              }}
            </Form.Item>

            <Form.Item
              name="name"
              label="组合场景名称"
              rules={[{ required: true, message: '请输入组合场景名称' }]}
            >
              <Input placeholder="组合场景名称" />
            </Form.Item>

            <Form.Item
              name="successCondition"
              label="成功条件"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value="all_pass">全部场景测试通过</Radio>
                <Radio value="single_stats">单独统计各场景测试结果</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="executionMode"
              label="运行方式"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value="independent">使用独立客户端</Radio>
                <Radio value="shared">使用共享客户端</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="status" label="当前状态" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="active">有效</Radio>
                <Radio value="inactive">无效</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="备注" rows={3} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Included Scenes Modal */}
        {currentCombination && (
          <IncludedScenesModal
            open={includedModalOpen}
            onCancel={() => setIncludedModalOpen(false)}
            combinationId={currentCombination.id}
            combinationName={currentCombination.name}
            // Need to get the latest included scenes from store, not just snapshot state
            // because `currentCombination` might be stale if we only set it once.
            // Better to find it from `scenes`
            includedScenes={
              scenes.find((s) => s.id === currentCombination.id)?.includedScenes || []
            }
          />
        )}

        <ExecutionResultModal
          open={resultModalOpen}
          onCancel={() => setResultModalOpen(false)}
          combinationName={executingCombination}
          results={executionResults}
        />
      </div>
    </MainLayout>
  );
}
