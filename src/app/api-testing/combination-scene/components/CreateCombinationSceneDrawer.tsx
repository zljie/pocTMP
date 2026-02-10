import React, { useState, useSyncExternalStore, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tabs,
  Row,
  Col,
  InputNumber,
  Switch,
  Card,
  Divider,
  Tag,
  Typography,
  List,
  Modal,
  Radio,
  message
} from 'antd';
import {
  PlusOutlined,
  InfoCircleOutlined,
  UserOutlined,
  LinkOutlined,
  CodeOutlined,
  SafetyCertificateOutlined,
  ControlOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SettingOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';
import combinationSceneStore, { CombinationSceneType, IncludedScene, SceneConfig } from '@/stores/combinationSceneStore';
import sceneStore, { SceneType } from '@/stores/sceneStore';
import apiTestEnvironmentStore from '@/stores/apiTestEnvironmentStore';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface CreateCombinationSceneDrawerProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  initialValues?: CombinationSceneType;
}

// --- Sub-Component: Step Configuration Modal (Visual refinement of SceneConfigModal) ---
interface StepConfigModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (config: SceneConfig) => void;
  initialConfig: SceneConfig;
  sceneName: string;
}

const StepConfigModal: React.FC<StepConfigModalProps> = ({
  open,
  onCancel,
  onSave,
  initialConfig,
  sceneName,
}) => {
  const [form] = Form.useForm();
  const environments = useSyncExternalStore(
    apiTestEnvironmentStore.subscribe,
    apiTestEnvironmentStore.getSnapshot,
    apiTestEnvironmentStore.getServerSnapshot
  );
  const isAsync = Form.useWatch('isAsync', form);

  useEffect(() => {
    if (open) form.setFieldsValue(initialConfig);
  }, [open, initialConfig, form]);

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>步骤配置 - {sceneName}</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.validateFields().then(onSave)}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Tabs
          items={[
            {
              key: 'env',
              label: '运行环境',
              children: (
                <>
                  <Form.Item name="environmentId" label="指定测试环境">
                    <Select placeholder="默认使用全局配置" allowClear>
                      {environments
                        .filter((e) => e.status === 'active')
                        .map((e) => (
                          <Option key={e.id} value={e.id}>
                            {e.projectName} - {e.systemName}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="retryCount" label="重试次数">
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="isAsync" label="异步执行" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  {!isAsync && (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="testInterval" label="测试间隔 (ms)">
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="failureHandling" label="失败处理">
                          <Select>
                            <Option value="stop">结束测试</Option>
                            <Option value="continue">继续下一个</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                </>
              ),
            },
            {
              key: 'vars_in',
              label: '参数注入 (Input)',
              children: (
                <Form.List name="replaceVariables">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'variableName']}
                            rules={[{ required: true, message: '参数名' }]}
                          >
                            <Input placeholder="目标参数名" prefix="@" />
                          </Form.Item>
                          <span style={{ color: '#999' }}>←</span>
                          <Form.Item
                            {...restField}
                            name={[name, 'sourceType']}
                            initialValue="context"
                          >
                            <Select style={{ width: 100 }}>
                              <Option value="context">上下文</Option>
                              <Option value="constant">常量</Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'sourceValue']}
                            rules={[{ required: true, message: '值' }]}
                          >
                            <Input placeholder="来源变量名/值" />
                          </Form.Item>
                          <DeleteOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                        </Space>
                      ))}
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        添加注入规则
                      </Button>
                    </>
                  )}
                </Form.List>
              ),
            },
            {
              key: 'vars_out',
              label: '参数提取 (Output)',
              disabled: isAsync,
              children: (
                <Form.List name="saveVariables">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'variableName']}
                            rules={[{ required: true, message: '变量名' }]}
                          >
                            <Input placeholder="存入变量名" prefix="$" />
                          </Form.Item>
                          <span style={{ color: '#999' }}>←</span>
                          <Form.Item
                            {...restField}
                            name={[name, 'sourceType']}
                            initialValue="output"
                          >
                            <Select style={{ width: 100 }}>
                              <Option value="output">Body</Option>
                              <Option value="response_header">Header</Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'sourcePath']}
                            rules={[{ required: true, message: '路径' }]}
                          >
                            <Input placeholder="JSONPath (e.g. data.id)" />
                          </Form.Item>
                          <DeleteOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                        </Space>
                      ))}
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        添加提取规则
                      </Button>
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

// --- Main Drawer Component ---

export const CreateCombinationSceneDrawer: React.FC<CreateCombinationSceneDrawerProps> = ({
  open,
  onCancel,
  onOk,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  
  // Included Scenes State
  const [includedScenes, setIncludedScenes] = useState<IncludedScene[]>([]);
  
  // Modals State
  const [sceneSelectOpen, setSceneSelectOpen] = useState(false);
  const [stepConfigOpen, setStepConfigOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<{ index: number; config: SceneConfig; name: string } | null>(null);

  // Store Data
  const allScenes = useSyncExternalStore(sceneStore.subscribe, sceneStore.getSnapshot, sceneStore.getServerSnapshot).scenes;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
        // Deep copy included scenes to local state
        setIncludedScenes(initialValues.includedScenes || []);
      } else {
        form.resetFields();
        setIncludedScenes([]);
        form.setFieldsValue({
          status: 'active',
          successCondition: 'single_stats',
          executionMode: 'independent',
          priority: 'P1'
        });
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // Merge included scenes into values
      const finalValues = {
        ...values,
        includedScenes: includedScenes.map((s, idx) => ({ ...s, executeOrder: idx + 1 })),
      };
      onOk(finalValues);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // --- Step Management Logic ---

  const handleAddScenes = (selectedIds: React.Key[]) => {
    const newScenes: IncludedScene[] = selectedIds.map(id => {
      const original = allScenes.find(s => s.id === id);
      if (!original) return null;
      return {
        id: Math.random().toString(36).substr(2, 9), // Temp ID for list item
        sceneId: original.id,
        sceneName: original.name,
        interfaceName: original.interfaceName,
        messageName: original.messageName,
        testDataCount: original.testDataCount,
        validationRuleCount: original.validationRuleCount,
        executeOrder: includedScenes.length + 1,
        config: {}, // Empty config initially
        projectId: original.projectId,
      };
    }).filter(Boolean) as IncludedScene[];

    setIncludedScenes([...includedScenes, ...newScenes]);
    setSceneSelectOpen(false);
    message.success(`已添加 ${newScenes.length} 个步骤`);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newScenes = [...includedScenes];
    if (direction === 'up' && index > 0) {
      [newScenes[index], newScenes[index - 1]] = [newScenes[index - 1], newScenes[index]];
    } else if (direction === 'down' && index < newScenes.length - 1) {
      [newScenes[index], newScenes[index + 1]] = [newScenes[index + 1], newScenes[index]];
    }
    setIncludedScenes(newScenes);
  };

  const removeStep = (index: number) => {
    const newScenes = [...includedScenes];
    newScenes.splice(index, 1);
    setIncludedScenes(newScenes);
  };

  const openStepConfig = (index: number) => {
    const step = includedScenes[index];
    setCurrentStep({
      index,
      config: step.config || {},
      name: step.sceneName
    });
    setStepConfigOpen(true);
  };

  const saveStepConfig = (newConfig: SceneConfig) => {
    if (currentStep) {
      const newScenes = [...includedScenes];
      newScenes[currentStep.index].config = newConfig;
      setIncludedScenes(newScenes);
      setStepConfigOpen(false);
      message.success('步骤配置已保存');
    }
  };

  // --- Render Sections ---

  const renderBasicInfo = () => (
    <Row gutter={24}>
      <Col span={12}>
        <Form.Item name="name" label="组合场景名称" rules={[{ required: true }]}>
          <Input placeholder="例如：用户注册下单全流程" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="projectId" label="所属项目" rules={[{ required: true }]}>
          <Select placeholder="选择项目">
            <Option value="p1">基础资料平台(mdm)</Option>
            <Option value="p2">示例项目B</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item name="remark" label="场景说明">
          <TextArea rows={3} placeholder="描述业务流程逻辑..." />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="tags" label="标签">
          <Select mode="tags" placeholder="输入标签" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="priority" label="优先级">
          <Select>
            <Option value="P0">P0</Option>
            <Option value="P1">P1</Option>
            <Option value="P2">P2</Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>
  );

  const renderFlowOrchestration = () => (
    <div style={{ padding: '0 8px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Text strong>流程步骤 ({includedScenes.length})</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setSceneSelectOpen(true)}>
          添加步骤
        </Button>
      </div>

      <List
        dataSource={includedScenes}
        renderItem={(item, index) => (
          <List.Item key={item.id} style={{ padding: '12px 0' }}>
            <Card 
              size="small" 
              style={{ width: '100%', borderColor: '#e8e8e8' }}
              bodyStyle={{ padding: '12px' }}
            >
              <Row align="middle" gutter={16}>
                <Col flex="40px" style={{ textAlign: 'center' }}>
                  <Tag color="blue" style={{ marginRight: 0 }}>#{index + 1}</Tag>
                </Col>
                <Col flex="auto">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text strong>{item.sceneName}</Text>
                    <Tag>{item.interfaceName}</Tag>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                    {item.config?.replaceVariables?.length ? (
                        <Tag icon={<LinkOutlined />} color="orange">注入: {item.config.replaceVariables.length}</Tag>
                    ) : null}
                    {item.config?.saveVariables?.length ? (
                        <Tag icon={<CodeOutlined />} color="green">提取: {item.config.saveVariables.length}</Tag>
                    ) : null}
                    {item.config?.isAsync ? <Tag>异步</Tag> : null}
                  </div>
                </Col>
                <Col flex="150px" style={{ textAlign: 'right' }}>
                  <Space>
                    <Button 
                      type="text" 
                      icon={<ArrowUpOutlined />} 
                      disabled={index === 0}
                      onClick={() => moveStep(index, 'up')}
                    />
                    <Button 
                      type="text" 
                      icon={<ArrowDownOutlined />} 
                      disabled={index === includedScenes.length - 1}
                      onClick={() => moveStep(index, 'down')}
                    />
                    <Divider type="vertical" />
                    <Button 
                      type="link" 
                      icon={<SettingOutlined />} 
                      onClick={() => openStepConfig(index)}
                    >
                      配置
                    </Button>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeStep(index)}
                    />
                  </Space>
                </Col>
              </Row>
            </Card>
          </List.Item>
        )}
      />

      {includedScenes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', border: '1px dashed #d9d9d9', borderRadius: 6 }}>
          <NodeIndexOutlined style={{ fontSize: 24, marginBottom: 8 }} />
          <div>暂无步骤，请点击右上角添加</div>
        </div>
      )}
    </div>
  );

  const renderExecutionStrategy = () => (
    <Row gutter={24}>
      <Col span={12}>
        <Form.Item name="executionMode" label="运行方式">
          <Radio.Group>
            <Radio.Button value="independent">独立客户端</Radio.Button>
            <Radio.Button value="shared">共享客户端 (Cookie共享)</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="successCondition" label="成功条件">
          <Select>
            <Option value="all_pass">全部通过视为成功</Option>
            <Option value="single_stats">独立统计结果</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="status" label="状态">
          <Switch checkedChildren="有效" unCheckedChildren="无效" defaultChecked />
        </Form.Item>
      </Col>
    </Row>
  );

  const items = [
    { key: '1', label: '基础信息', children: renderBasicInfo(), icon: <InfoCircleOutlined /> },
    { key: '2', label: '流程编排', children: renderFlowOrchestration(), icon: <NodeIndexOutlined /> },
    { key: '3', label: '执行策略', children: renderExecutionStrategy(), icon: <ControlOutlined /> },
    { key: '4', label: '高级配置', children: <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>全局变量与通知配置 (开发中)</div>, icon: <SafetyCertificateOutlined /> },
  ];

  return (
    <>
      <Drawer
        title={initialValues ? "修改组合场景" : "新增组合场景"}
        width={900}
        onClose={onCancel}
        open={open}
        extra={
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleOk}>
              提交
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Tabs
            defaultActiveKey="1"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
          />
        </Form>
      </Drawer>

      {/* Internal Modals */}
      <Modal
        title="添加步骤 (选择场景)"
        open={sceneSelectOpen}
        onCancel={() => setSceneSelectOpen(false)}
        footer={null}
        width={800}
      >
        <SceneSelector onSelect={handleAddScenes} scenes={allScenes} />
      </Modal>

      {currentStep && (
        <StepConfigModal
          open={stepConfigOpen}
          onCancel={() => setStepConfigOpen(false)}
          onSave={saveStepConfig}
          initialConfig={currentStep.config}
          sceneName={currentStep.name}
        />
      )}
    </>
  );
};

// --- Helper Component: Scene Selector Table ---
const SceneSelector = ({ onSelect, scenes }: { onSelect: (ids: React.Key[]) => void, scenes: SceneType[] }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');

  const filtered = scenes.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <div>
      <Input.Search 
        placeholder="搜索场景" 
        style={{ marginBottom: 16 }} 
        onSearch={setSearchText} 
        onChange={e => setSearchText(e.target.value)}
      />
      <List
        dataSource={filtered}
        pagination={{ pageSize: 5 }}
        renderItem={item => (
            <List.Item
                actions={[
                    <Button 
                        size="small" 
                        type={selectedRowKeys.includes(item.id) ? 'primary' : 'default'}
                        onClick={() => {
                            if (selectedRowKeys.includes(item.id)) {
                                setSelectedRowKeys(selectedRowKeys.filter(k => k !== item.id));
                            } else {
                                setSelectedRowKeys([...selectedRowKeys, item.id]);
                            }
                        }}
                    >
                        {selectedRowKeys.includes(item.id) ? '已选' : '选择'}
                    </Button>
                ]}
            >
                <List.Item.Meta
                    title={item.name}
                    description={`${item.interfaceName} | ${item.projectName}`}
                />
            </List.Item>
        )}
      />
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Space>
            <span style={{ color: '#666' }}>已选 {selectedRowKeys.length} 项</span>
            <Button type="primary" onClick={() => onSelect(selectedRowKeys)} disabled={selectedRowKeys.length === 0}>
                确认添加
            </Button>
        </Space>
      </div>
    </div>
  );
};
