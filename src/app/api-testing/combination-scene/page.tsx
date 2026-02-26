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
import { CreateCombinationSceneDrawer } from './components/CreateCombinationSceneDrawer';

const { Text } = Typography;

// --- Types & Constants ---

const PROJECT_OPTIONS = [
  { label: '基础资料平台(mdm)', value: 'p1' },
  { label: '示例项目B', value: 'p2' },
];



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


/*
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
*/

// --- Main Page Component ---

export default function CombinationScenePage() {
  const scenes = useSyncExternalStore(
    combinationSceneStore.subscribe,
    combinationSceneStore.getSnapshot,
    combinationSceneStore.getServerSnapshot
  );

  const [searchForm] = Form.useForm();
  
  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<CombinationSceneType | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
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
    setEditingData(undefined);
    setIsDrawerOpen(true);
  };

  const handleEdit = (record: CombinationSceneType) => {
    setEditingId(record.id);
    setEditingData(record);
    setIsDrawerOpen(true);
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

  const handleDrawerOk = (values: any) => {
    try {
      if (editingId) {
        combinationSceneStore.update(editingId, values);
        message.success('更新成功');
      } else {
        combinationSceneStore.create(values);
        message.success('创建成功');
      }
      setIsDrawerOpen(false);
    } catch (error) {
      console.error(error);
    }
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
        <a onClick={() => handleEdit(record)}>
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

        <CreateCombinationSceneDrawer
          open={isDrawerOpen}
          onCancel={() => setIsDrawerOpen(false)}
          onOk={handleDrawerOk}
          initialValues={editingData}
        />

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
