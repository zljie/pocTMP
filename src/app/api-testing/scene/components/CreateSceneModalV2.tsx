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
  Tooltip,
  message,
  Modal,
  List,
  Typography
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  LinkOutlined,
  CodeOutlined,
  SafetyCertificateOutlined,
  AppstoreAddOutlined,
  CheckOutlined,
  ControlOutlined
} from '@ant-design/icons';
import messageStore from '@/stores/messageStore';
import assertionTemplateStore, { AssertionTemplate } from '@/stores/assertionTemplateStore';

interface CreateSceneModalV2Props {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
}

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

export const CreateSceneModalV2: React.FC<CreateSceneModalV2Props> = ({
  open,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  
  // Store Data
  const { messages, interfaces } = useSyncExternalStore(
    messageStore.subscribe,
    messageStore.getSnapshot,
    messageStore.getServerSnapshot
  );

  const assertionTemplates = useSyncExternalStore(
    assertionTemplateStore.subscribe,
    assertionTemplateStore.getSnapshot,
    assertionTemplateStore.getSnapshot
  );

  // Local State for filtering
  const [selectedInterfaceId, setSelectedInterfaceId] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedInterfaceId(null);
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Logic: Handle Interface Change
  const handleInterfaceChange = (interfaceId: string) => {
    setSelectedInterfaceId(interfaceId);
    const targetInterface = interfaces.find(i => i.id === interfaceId);
    
    // Reset Message Selection
    form.setFieldsValue({ messageId: undefined });

    if (targetInterface) {
      // Auto-fill Project Name if available
      if (targetInterface.projectName) {
        form.setFieldsValue({ projectName: targetInterface.projectName });
      }

      // Auto-fill Execution Config (can be overwritten by user)
      form.setFieldsValue({
        method: targetInterface.method || 'POST',
        url: targetInterface.path || '',
      });
      
      message.info('已根据接口信息自动填充 URL 和 请求方法');
    }
  };

  // Logic: Handle Message Change
  const handleMessageChange = (messageId: string) => {
    const targetMessage = messages.find(m => m.id === messageId);
    if (!targetMessage) return;

    // 1. Auto-fill Interface if not selected
    if (targetMessage.interfaceId && form.getFieldValue('interfaceId') !== targetMessage.interfaceId) {
      form.setFieldsValue({ interfaceId: targetMessage.interfaceId });
      setSelectedInterfaceId(targetMessage.interfaceId);
    }

    // 2. Auto-fill Project
    if (targetMessage.projectName) {
      form.setFieldsValue({ projectName: targetMessage.projectName });
    }

    // 3. Auto-fill Method & URL
    // Priority: Message Config > Interface Config
    const targetInterface = interfaces.find(i => i.id === targetMessage.interfaceId);
    
    const method = targetMessage.headerConfig?.method || targetInterface?.method || 'POST';
    const url = targetMessage.requestPath || targetInterface?.path || '';

    form.setFieldsValue({
      method,
      url,
      body: targetMessage.body || '',
    });

    // 4. Auto-fill Headers
    if (targetMessage.headerConfig?.headers && Array.isArray(targetMessage.headerConfig.headers)) {
      form.setFieldsValue({
        headers: targetMessage.headerConfig.headers
      });
    }

    message.success('已根据报文配置自动填充测试执行信息');
  };

  const handleApplyTemplate = (template: AssertionTemplate) => {
    const currentAssertions = form.getFieldValue('assertions') || [];
    const newAssertions = template.rules.map(rule => ({
      checkPoint: rule.checkPoint,
      operator: rule.operator,
      value: rule.value,
      // Adapt field names if needed
    }));
    
    form.setFieldsValue({
      assertions: [...currentAssertions, ...newAssertions]
    });
    
    message.success(`已应用模板：${template.name}`);
    setTemplateModalOpen(false);
  };

  // Filter messages based on selected interface
  const filteredMessages = selectedInterfaceId 
    ? messages.filter(m => m.interfaceId === selectedInterfaceId)
    : messages;

  const renderTemplateList = (category: string) => {
    const list = assertionTemplates.filter(t => t.category === category);
    return (
      <List
        dataSource={list}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button 
                type="link" 
                key="apply" 
                icon={<CheckOutlined />} 
                onClick={() => handleApplyTemplate(item)}
              >
                应用
              </Button>
            ]}
          >
            <List.Item.Meta
              title={<Text strong>{item.name}</Text>}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text>
                  <Space size="small" style={{ marginTop: 4 }}>
                    {item.rules.map((r, idx) => (
                      <Tag key={idx} color="blue">{r.checkPoint} {r.operator} {r.value}</Tag>
                    ))}
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const renderBasicInfo = () => (
    <Row gutter={24}>
      <Col span={12}>
        <Form.Item
          name="name"
          label="场景名称"
          rules={[{ required: true, message: '请输入场景名称' }]}
          tooltip="唯一标识，便于检索与管理（如“用户登录-密码错误锁定账户”）"
        >
          <Input placeholder="例如：用户登录-密码错误锁定账户" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="code"
          label="场景编码/ID"
          tooltip="自动化脚本或平台内部使用的唯一标识"
        >
          <Input placeholder="例如：LOGIN_PWD_LOCK_01" />
        </Form.Item>
      </Col>
      
      {/* New Selection Fields */}
      <Col span={12}>
        <Form.Item
          name="interfaceId"
          label="所属接口"
          rules={[{ required: true, message: '请选择所属接口' }]}
        >
          <Select 
            placeholder="选择接口" 
            onChange={handleInterfaceChange}
            showSearch
            optionFilterProp="children"
          >
            {interfaces.map(i => (
              <Option key={i.id} value={i.id}>{i.name_cn || i.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          name="messageId"
          label="所属报文"
          rules={[{ required: true, message: '请选择所属报文' }]}
        >
          <Select 
            placeholder="选择报文" 
            onChange={handleMessageChange}
            showSearch
            optionFilterProp="children"
            disabled={!selectedInterfaceId && filteredMessages.length === messages.length} // Optional: logic to control enablement
          >
            {filteredMessages.map(m => (
              <Option key={m.id} value={m.id}>{m.name}</Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
       <Col span={12}>
        <Form.Item
          name="projectName"
          label="所属项目"
        >
          <Input disabled placeholder="自动关联项目" />
        </Form.Item>
      </Col>

      <Col span={24}>
        <Form.Item
          name="description"
          label="场景说明"
        >
          <TextArea rows={3} placeholder="业务背景、测试目标、流程概述" />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item
          name="requirements"
          label="关联需求/用户故事"
        >
          <Select
            mode="multiple"
            placeholder="请选择关联的需求"
            options={[
              { label: 'REQ#2024-login-security', value: 'req-001' },
              { label: 'REQ#2024-payment-flow', value: 'req-002' },
            ]}
          />
        </Form.Item>
      </Col>
    </Row>
  );

  const renderExecutionConfig = () => (
    <>
      <Card title="接口信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name="method" label="请求方法" initialValue="POST">
              <Select>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="DELETE">DELETE</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={18}>
            <Form.Item name="url" label="URL / 路由" rules={[{ required: true }]}>
              <Input addonBefore="https://" placeholder="api/v1/login" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="请求报文" size="small" style={{ marginBottom: 16 }}>
        <Tabs
          items={[
            {
              key: 'header',
              label: 'Header',
              children: (
                <Form.List name="headers">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'key']}
                            rules={[{ required: true, message: 'Missing key' }]}
                          >
                            <Input placeholder="Key" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{ required: true, message: 'Missing value' }]}
                          >
                            <Input placeholder="Value" />
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
              ),
            },
            {
              key: 'body',
              label: 'Body',
              children: (
                <Form.Item name="body">
                  <TextArea
                    rows={6}
                    placeholder='{"username":"${test_user}","password":"wrong"}'
                    style={{ fontFamily: 'monospace' }}
                  />
                </Form.Item>
              ),
            },
          ]}
        />
      </Card>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="前置条件" size="small">
            <Form.List name="preConditions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                      >
                        <Select style={{ width: 120 }} placeholder="类型">
                          <Option value="data">数据准备</Option>
                          <Option value="api">依赖接口</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'desc']}
                      >
                        <Input placeholder="描述" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加前置条件
                  </Button>
                </>
              )}
            </Form.List>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="后置动作" size="small">
            <Form.List name="postActions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                       <Form.Item
                        {...restField}
                        name={[name, 'type']}
                      >
                        <Select style={{ width: 120 }} placeholder="类型">
                          <Option value="clean">数据清理</Option>
                          <Option value="callback">回调通知</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'desc']}
                      >
                        <Input placeholder="描述" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加后置动作
                  </Button>
                </>
              )}
            </Form.List>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderValidation = () => (
    <>
      <Form.Item name="acceptanceCriteria" label="场景验收标准">
        <TextArea placeholder="业务层面的预期结果（如“连续输错3次密码后账户锁定”）" />
      </Form.Item>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Divider orientation="left" style={{ margin: '12px 0', flex: 1 }}>断言规则</Divider>
        <Button 
          type="dashed" 
          size="small" 
          icon={<AppstoreAddOutlined />} 
          onClick={() => setTemplateModalOpen(true)}
        >
          从模板导入
        </Button>
      </div>

      <Form.List name="assertions">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} size="small" style={{ marginBottom: 12 }}>
                <Space align="baseline" style={{ flexWrap: 'wrap' }}>
                   <Form.Item
                    {...restField}
                    name={[name, 'checkPoint']}
                    label="检查点"
                    style={{ width: 150 }}
                  >
                    <Select placeholder="选择检查点">
                      <Option value="statusCode">状态码</Option>
                      <Option value="responseTime">响应时间</Option>
                      <Option value="jsonField">JSON字段</Option>
                      <Option value="dbField">数据库字段</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'operator']}
                    label="操作符"
                    style={{ width: 120 }}
                  >
                    <Select placeholder="操作符">
                      <Option value="eq">等于</Option>
                      <Option value="contains">包含</Option>
                      <Option value="gt">大于</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    label="预期值"
                    style={{ width: 200 }}
                  >
                    <Input placeholder="预期值" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              添加断言规则
            </Button>
          </>
        )}
      </Form.List>

      <Divider orientation="left">预期异常处理</Divider>
      <Form.Item name="expectedException" label="预期异常">
        <Input placeholder="针对异常流的断言（如请求非法参数时返回特定错误码）" />
      </Form.Item>
    </>
  );

  const renderControl = () => (
    <Row gutter={24}>
      <Col span={12}>
        <Form.Item name="sceneType" label="场景类型">
          <Select placeholder="请选择">
            <Option value="smoke">冒烟测试</Option>
            <Option value="regression">回归测试</Option>
            <Option value="abnormal">异常流</Option>
            <Option value="performance">性能测试</Option>
            <Option value="compliance">合规性测试</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="priority" label="执行优先级">
          <Select placeholder="请选择">
            <Option value="P0">P0 (最高)</Option>
            <Option value="P1">P1</Option>
            <Option value="P2">P2</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="retryCount" label="重试次数">
          <InputNumber min={0} max={5} style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="timeout" label="超时设置(ms)">
          <InputNumber min={0} step={1000} style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item name="dataDriven" label="数据驱动配置" tooltip="关联数据源（如CSV文件、数据库表）">
           <Input.Group compact>
              <Select style={{ width: '30%' }} defaultValue="none">
                <Option value="none">无</Option>
                <Option value="csv">CSV文件</Option>
                <Option value="db">数据库表</Option>
              </Select>
              <Input style={{ width: '70%' }} placeholder="选择或输入数据源路径/表名" />
           </Input.Group>
        </Form.Item>
      </Col>
    </Row>
  );

  const renderCollaboration = () => (
    <Row gutter={24}>
      <Col span={12}>
        <Form.Item name="owner" label="责任人/创建者">
          <Select
            showSearch
            placeholder="选择责任人"
            optionFilterProp="children"
          >
             <Option value="zhangsan">张三</Option>
             <Option value="lisi">李四</Option>
          </Select>
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item name="version" label="版本关联">
          <Input placeholder="v1.0.0" prefix={<Tag color="blue">Ver</Tag>} />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item name="tags" label="标签/分类">
          <Select mode="tags" placeholder="输入标签后回车">
            <Option value="payment">支付模块</Option>
            <Option value="ecommerce">电商流程</Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>
  );

  const renderAdvanced = () => (
    <>
      <Form.Item label="场景编排逻辑">
         <Select placeholder="选择流程逻辑" defaultValue="serial">
           <Option value="serial">串行执行</Option>
           <Option value="parallel">并行执行</Option>
           <Option value="condition">条件分支</Option>
         </Select>
      </Form.Item>
      
      <Form.Item label="动态参数提取">
        <Form.List name="dynamicParams">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item {...restField} name={[name, 'source']} style={{ width: 120 }}>
                    <Select placeholder="来源">
                       <Option value="body">Body</Option>
                       <Option value="header">Header</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'jsonPath']} style={{ width: 200 }}>
                    <Input placeholder="JSONPath (e.g. $.token)" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'varName']} style={{ width: 150 }}>
                    <Input placeholder="变量名" prefix="$" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                添加参数提取规则
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>

      <Divider orientation="left">安全与性能</Divider>
      <Row gutter={24}>
         <Col span={12}>
            <Form.Item name="encryption" label="加密算法">
              <Select placeholder="选择加密方式">
                <Option value="none">无</Option>
                <Option value="aes">AES</Option>
                <Option value="rsa">RSA</Option>
              </Select>
            </Form.Item>
         </Col>
         <Col span={12}>
            <Form.Item name="performanceThreshold" label="性能阈值(TPS)">
              <InputNumber style={{ width: '100%' }} placeholder="例如 1000" />
            </Form.Item>
         </Col>
      </Row>
    </>
  );

  const items = [
    { key: '1', label: '基础信息', children: renderBasicInfo(), icon: <InfoCircleOutlined /> },
    { key: '2', label: '测试执行', children: renderExecutionConfig(), icon: <CodeOutlined /> },
    { key: '3', label: '验证与断言', children: renderValidation(), icon: <SafetyCertificateOutlined /> },
    { key: '4', label: '执行控制', children: renderControl(), icon: <ControlOutlined /> },
    { key: '5', label: '协作维护', children: renderCollaboration(), icon: <UserOutlined /> },
    { key: '6', label: '高级配置', children: renderAdvanced(), icon: <LinkOutlined /> },
  ];

  return (
    <Drawer
      title="新增测试场景 (V2)"
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
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priority: 'P1',
          method: 'POST',
          retryCount: 0,
        }}
      >
        <Tabs
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
        />
      </Form>

      <Modal
        title="选择断言模板"
        open={templateModalOpen}
        onCancel={() => setTemplateModalOpen(false)}
        footer={null}
        width={600}
      >
        <Tabs
          defaultActiveKey="built-in"
          items={[
            {
              key: 'built-in',
              label: '内置通用模板',
              children: renderTemplateList('built-in'),
            },
            {
              key: 'project',
              label: '项目级模板',
              children: renderTemplateList('project'),
            },
            {
              key: 'personal',
              label: '个人收藏',
              children: renderTemplateList('personal'),
            },
          ]}
        />
      </Modal>
    </Drawer>
  );
};
