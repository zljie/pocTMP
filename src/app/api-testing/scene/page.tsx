'use client';

import React, { useState, useSyncExternalStore } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Modal,
  message,
  Popconfirm,
  Radio,
  Row,
  Col,
  Checkbox,
  Switch,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import sceneStore, { SceneType, SceneTestData, ValidationRule } from '@/stores/sceneStore';
import messageStore, { MessageType } from '@/stores/messageStore';
import apiTestEnvironmentStore from '@/stores/apiTestEnvironmentStore';

// --- Sub-Components ---

// 0. Execute Scene Modal
interface ExecuteSceneModalProps {
  open: boolean;
  onCancel: () => void;
  scene: SceneType | null;
}

const ExecuteSceneModal: React.FC<ExecuteSceneModalProps> = ({ open, onCancel, scene }) => {
  const environments = useSyncExternalStore(apiTestEnvironmentStore.subscribe, apiTestEnvironmentStore.getSnapshot, apiTestEnvironmentStore.getServerSnapshot);
  
  const [step, setStep] = useState<'config' | 'result'>('config');
  const [loading, setLoading] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<string | undefined>(undefined);
  const [selectedData, setSelectedData] = useState<string | undefined>(undefined);
  const [requestUrl, setRequestUrl] = useState('');
  const [requestBody, setRequestBody] = useState('');

  // Reset state when modal opens or scene changes
  React.useEffect(() => {
    if (open && scene) {
      setStep('config');
      setLoading(false);
      setRequestUrl(scene.requestPath || '');
      
      // Default Environment
      if (scene.environmentIds?.length > 0) {
        setSelectedEnv(scene.environmentIds[0]);
      } else {
        setSelectedEnv(undefined);
      }

      // Default Data
      const defaultData = scene.testDataList?.find(d => d.isDefault);
      if (defaultData) {
        setSelectedData(defaultData.id);
        setRequestBody(defaultData.content || '');
      } else if (scene.testDataList && scene.testDataList.length > 0) {
        setSelectedData(scene.testDataList[0].id);
        setRequestBody(scene.testDataList[0].content || '');
      } else {
        setSelectedData(undefined);
        setRequestBody('');
      }
    }
  }, [open, scene]);

  const handleDataChange = (dataId: string) => {
    setSelectedData(dataId);
    const data = scene?.testDataList?.find(d => d.id === dataId);
    if (data) {
      setRequestBody(data.content || '');
    }
  };

  const handleExecute = () => {
    if (!selectedEnv || !selectedData) {
      message.error('请选择测试环境和测试数据');
      return;
    }
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      setStep('result');
    }, 1000);
  };

  const renderConfig = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input 
        addonBefore="GET" 
        value={requestUrl} 
        onChange={(e) => setRequestUrl(e.target.value)}
      />
      
      <Select
        placeholder="请选择测试环境"
        style={{ width: '100%' }}
        value={selectedEnv}
        onChange={setSelectedEnv}
      >
        {environments
          .filter(env => scene?.environmentIds?.includes(env.id) || scene?.environmentIds?.includes(env.systemId) || true) // Simplified logic
          .map(env => (
            <Select.Option key={env.id} value={env.id}>{env.systemName} [{env.ipAddress}]</Select.Option>
          ))}
      </Select>

      <Select
        placeholder="请选择测试数据"
        style={{ width: '100%' }}
        value={selectedData}
        onChange={handleDataChange}
      >
        {scene?.testDataList?.map(data => (
          <Select.Option key={data.id} value={data.id}>{data.mark}</Select.Option>
        ))}
      </Select>

      <Input.TextArea
        rows={6}
        value={requestBody}
        onChange={(e) => setRequestBody(e.target.value)}
        placeholder="请求参数预览"
      />

      {!selectedEnv || !selectedData ? (
        <div style={{ color: 'red', fontSize: 12 }}>请选择测试环境和测试数据，测试数据可以编辑</div>
      ) : null}

      <div style={{ textAlign: 'right' }}>
        <Button type="primary" onClick={handleExecute} loading={loading}>
          执行测试
        </Button>
      </div>
    </div>
  );

  const renderResult = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '600px', overflowY: 'auto' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Tag color="success" icon={<CheckCircleOutlined />}>SUCCESS</Tag>
          <Button type="primary" size="small">保存出参示例</Button>
       </div>

       <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
         <p><strong>请求地址:</strong> {requestUrl}</p>
         <p><strong>测试环境:</strong> {environments.find(e => e.id === selectedEnv)?.systemName}</p>
         <p><strong>数据包:</strong> {scene?.testDataList?.find(d => d.id === selectedData)?.mark}</p>
         <p><strong>耗时:</strong> 46ms</p>
         <p><strong>状态码:</strong> <span style={{ color: 'green' }}>200</span></p>
       </div>

       <div>
         <strong>头信息:</strong>
         <Input.TextArea 
            readOnly 
            rows={4} 
            value={JSON.stringify({
              "Date": new Date().toUTCString(),
              "Content-Type": "application/json;charset=UTF-8",
              "Transfer-Encoding": "chunked",
              "Connection": "keep-alive"
            }, null, 2)} 
            style={{ marginTop: 8 }}
         />
       </div>

       <div>
         <strong>测试备注:</strong>
         <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 8, marginTop: 8, background: '#fff' }}>
            <div style={{ color: 'green', marginBottom: 4 }}>
              【自定义验证】验证状态码: 状态码为200, 与比对值200比对正确, 验证成功!
            </div>
            <div style={{ color: 'green' }}>
              【节点验证】在验证出参节点路径为 success 时: 预期结果为 [true], 与实际结果 [true] 验证一致, 验证成功!
            </div>
            <div style={{ marginTop: 8, color: '#666' }}>总共2条验证规则, 成功2条, 失败0条.</div>
         </div>
       </div>

       <div>
         <strong>入参:</strong>
         <Input.TextArea readOnly rows={3} value={requestBody} style={{ marginTop: 8 }} />
       </div>

       <div>
         <strong>出参:</strong>
         <Input.TextArea 
           readOnly 
           rows={6} 
           value={JSON.stringify({
             "success": true,
             "code": "200",
             "message": null,
             "detail": null,
             "traceId": "4ff74197bcae181c"
           }, null, 2)} 
           style={{ marginTop: 8 }} 
         />
       </div>
    </div>
  );

  return (
    <Modal
      title={`${scene?.name} - ${step === 'config' ? '测试' : '测试结果'}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      {step === 'config' ? renderConfig() : renderResult()}
    </Modal>
  );
};

// 1. Select Message Modal
interface SelectMessageModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (record: MessageType) => void;
  messages: MessageType[];
}

const SelectMessageModal: React.FC<SelectMessageModalProps> = ({
  open,
  onCancel,
  onSelect,
  messages,
}) => {
  const [searchText, setSearchText] = useState('');
  
  const filteredData = messages.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<MessageType> = [
    { title: '报文ID', dataIndex: 'id', width: 80 },
    { title: '报文名称', dataIndex: 'name', width: 200 },
    { title: '所属接口', dataIndex: 'interfaceName', width: 200 },
    { title: '类型', dataIndex: 'type', width: 100 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      width: 80,
      render: (status) => <Tag color={status === 'active' ? 'blue' : 'red'}>{status === 'active' ? '有效' : '无效'}</Tag>
    },
    { title: '所属项目', dataIndex: 'projectName', width: 150 },
  ];

  return (
    <Modal
      title="请选择报文"
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      <Space style={{ marginBottom: 16 }}>
        <Input 
          placeholder="报文名称" 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Button type="primary" onClick={() => {}}>查询</Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        rowSelection={{
          type: 'radio',
          onSelect: (record) => {
            onSelect(record);
            onCancel();
          },
        }}
      />
    </Modal>
  );
};

// 2. Select Environment Modal
interface SelectEnvironmentModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: string[]) => void;
  initialValues?: string[];
  selectionMode?: 'multiple' | 'single';
}

const SelectEnvironmentModal: React.FC<SelectEnvironmentModalProps> = ({
  open,
  onCancel,
  onOk,
  initialValues,
  selectionMode = 'multiple',
}) => {
  const options = [
    { label: 'HCM权限操作端口', value: 'hcm_op' },
    { label: 'HCM权限登录端口', value: 'hcm_login' },
    { label: '其他用工权限登录端口', value: 'other_login' },
    { label: '其他', value: 'other' },
  ];

  const [checkedValues, setCheckedValues] = useState<string[]>([]);

  React.useEffect(() => {
    if (open) {
      setCheckedValues(initialValues || []);
    }
  }, [open, initialValues]);

  return (
    <Modal
      title="请选择所属的测试环境"
      open={open}
      onCancel={onCancel}
      onOk={() => onOk(checkedValues)}
      width={600}
    >
      {selectionMode === 'multiple' ? (
        <Checkbox.Group 
          options={options} 
          value={checkedValues} 
          onChange={(vals) => setCheckedValues(vals as string[])}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        />
      ) : (
        <Radio.Group
          options={options}
          value={checkedValues[0]}
          onChange={(e) => setCheckedValues([e.target.value])}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        />
      )}
    </Modal>
  );
};

// 3. Set Data Content Modal
interface SetDataContentModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (content: string) => void;
  initialContent?: string;
}

const SetDataContentModal: React.FC<SetDataContentModalProps> = ({
  open,
  onCancel,
  onOk,
  initialContent,
}) => {
  const [content, setContent] = useState('');
  
  React.useEffect(() => {
    if (open) {
      setContent(initialContent || '');
    }
  }, [open, initialContent]);

  return (
    <Modal
      title="设置数据"
      open={open}
      onCancel={onCancel}
      onOk={() => onOk(content)}
      width={800}
      okText="确定"
      cancelText="取消"
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
           <Input placeholder="username" style={{ width: 120 }} />
           <Input placeholder="张三" style={{ width: 200 }} />
           <Button type="primary" onClick={() => setContent(`username=张三`)}>生成报文</Button>
           <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>确定</Button>
        </Space>
      </div>
      <Input.TextArea 
        rows={10} 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="username=张三"
      />
      <div style={{ marginTop: 8, color: 'red' }}>请填写参数值，再点击生成报文</div>
    </Modal>
  );
};

// 4. Test Data Form Modal (Add/Edit)
interface TestDataFormModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: Partial<SceneTestData>) => void;
  initialValues?: Partial<SceneTestData>;
}

const TestDataFormModal: React.FC<TestDataFormModalProps> = ({
  open,
  onCancel,
  onOk,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [currentEnvIds, setCurrentEnvIds] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState('');

  React.useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          envDisplay: initialValues.environmentIds?.length ? `已选择 ${initialValues.environmentIds.length} 个环境` : '',
        });
        setCurrentEnvIds(initialValues.environmentIds || []);
        setCurrentContent(initialValues.content || '');
      } else {
        form.setFieldsValue({
          type: 'reusable',
          status: 'active',
          autoExecute: true,
          isDefault: false,
        });
        setCurrentEnvIds([]);
        setCurrentContent('');
      }
    }
  }, [open, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then(values => {
      onOk({
        ...values,
        environmentIds: currentEnvIds,
        content: currentContent,
      });
    });
  };

  return (
    <Modal
      title={initialValues?.id ? "修改" : "新增"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={700}
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
        <Form.Item name="mark" label="数据标记" rules={[{ required: true, message: '请输入数据标记' }]}>
           <Input placeholder="区别不同数据的标识，自定义" />
        </Form.Item>

        <Form.Item label="可用于的测试环境">
          <Space>
            <Form.Item name="envDisplay" noStyle>
              <Input readOnly placeholder="不选择默认适用于所有测试环境" style={{ width: 250 }} />
            </Form.Item>
            <Button type="primary" onClick={() => setEnvModalOpen(true)}>选择</Button>
          </Space>
        </Form.Item>

        <Form.Item label="数据内容">
          <Button type="primary" onClick={() => setContentModalOpen(true)}>设置</Button>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
             {currentContent ? '已设置内容' : '暂无内容'}
          </div>
        </Form.Item>

        <Form.Item name="type" label="数据类型" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value="reusable">可重复使用</Radio>
            <Radio value="one-time">一次性数据</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="status" label="可用状态" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value="active">有效</Radio>
            <Radio value="inactive">无效</Radio>
            <Radio value="used" disabled>已使用</Radio>
            <Radio value="occupied" disabled>被占用</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="autoExecute" label="场景自动执行" valuePropName="checked">
           <Radio.Group>
             <Radio value={true}>是</Radio>
             <Radio value={false}>否</Radio>
           </Radio.Group>
        </Form.Item>

        <Form.Item name="isDefault" label="默认数据" valuePropName="checked">
           <Radio.Group>
             <Radio value={true}>是</Radio>
             <Radio value={false}>否</Radio>
           </Radio.Group>
        </Form.Item>
      </Form>

      <SelectEnvironmentModal
        open={envModalOpen}
        onCancel={() => setEnvModalOpen(false)}
        onOk={(ids) => {
          setCurrentEnvIds(ids);
          form.setFieldValue('envDisplay', ids.length ? `已选择 ${ids.length} 个环境` : '');
          setEnvModalOpen(false);
        }}
        initialValues={currentEnvIds}
      />

      <SetDataContentModal
        open={contentModalOpen}
        onCancel={() => setContentModalOpen(false)}
        onOk={(content) => {
          setCurrentContent(content);
          setContentModalOpen(false);
        }}
        initialContent={currentContent}
      />
    </Modal>
  );
};

// 5. Test Data Management Modal (List)
interface TestDataModalProps {
  open: boolean;
  onCancel: () => void;
  sceneName: string;
  sceneId: string;
  dataList: SceneTestData[];
}

const TestDataModal: React.FC<TestDataModalProps> = ({
  open,
  onCancel,
  sceneName,
  sceneId,
  dataList,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<SceneTestData | undefined>(undefined);

  const handleAdd = () => {
    setEditingData(undefined);
    setFormModalOpen(true);
  };

  const handleEdit = (record: SceneTestData) => {
    setEditingData(record);
    setFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    sceneStore.removeTestData(sceneId, [id]);
    message.success('删除成功');
  };

  const handleBatchDelete = () => {
    if (!selectedRowKeys.length) return;
    sceneStore.removeTestData(sceneId, selectedRowKeys as string[]);
    setSelectedRowKeys([]);
    message.success('批量删除成功');
  };

  const handleFormOk = (values: Partial<SceneTestData>) => {
    if (editingData) {
      sceneStore.updateTestData(sceneId, editingData.id, values);
      message.success('修改成功');
    } else {
      sceneStore.addTestData(sceneId, values);
      message.success('新增成功');
    }
    setFormModalOpen(false);
  };

  const columns: ColumnsType<SceneTestData> = [
    { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
    { title: '标记', dataIndex: 'mark', width: 150, align: 'center' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      width: 80, 
      align: 'center',
      render: (status) => <Tag color={status === 'active' ? 'blue' : 'red'}>{status === 'active' ? '有效' : '无效'}</Tag>
    },
    { 
      title: '默认数据', 
      dataIndex: 'isDefault', 
      width: 80, 
      align: 'center',
      render: (val) => val ? '是' : '否'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>修改</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
             <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
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
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" onClick={handleAdd}>新增</Button>
          <Button danger onClick={handleBatchDelete}>批量删除</Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataList}
        pagination={{ pageSize: 5 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        size="small"
      />
      
      <TestDataFormModal
        open={formModalOpen}
        onCancel={() => setFormModalOpen(false)}
        onOk={handleFormOk}
        initialValues={editingData}
      />
    </Modal>
  );
};

// 6. Validation Rule Form Modal
interface ValidationRuleFormModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: Partial<ValidationRule>) => void;
  initialValues?: Partial<ValidationRule>;
}

const ValidationRuleFormModal: React.FC<ValidationRuleFormModalProps> = ({
  open,
  onCancel,
  onOk,
  initialValues,
}) => {
  const [form] = Form.useForm();
  
  React.useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue(initialValues || {
        status: 'active',
        validationType: 'constant',
        compareCondition: 'equal',
      });
    }
  }, [open, initialValues, form]);

  const items = [
    {
      key: '1',
      label: '关联验证',
      children: (
        <>
          <Form.Item name="mode" label="模式" initialValue="select">
             <Select placeholder="请选择 (非必选)">
               <Select.Option value="select">请选择</Select.Option>
             </Select>
          </Form.Item>
          <Form.Item name="leftBoundary" label="左边界">
             <Input placeholder="关联左边界" />
          </Form.Item>
          <Form.Item name="rightBoundary" label="右边界">
             <Input placeholder="关联右边界" />
          </Form.Item>
          <Form.Item name="offsetChars" label="偏移字符数">
             <Input placeholder="左起偏移字符数" />
          </Form.Item>
          <Form.Item name="fetchOrder" label="取值顺序">
             <Input placeholder="取值顺序 (不需要请设为1)" />
          </Form.Item>
          <Form.Item name="fetchLength" label="取值长度">
             <Input placeholder="左起截取的字符长度" />
          </Form.Item>
        </>
      ),
    },
    {
      key: '2',
      label: '节点验证',
      children: <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>节点验证配置内容</div>,
    },
    {
      key: '3',
      label: '自定义验证',
      children: (
        <>
          <Form.Item name="expectedCompareType" label="预期比对值类型">
             <Select placeholder="请选择">
               <Select.Option value="responseTime">响应时间</Select.Option>
               <Select.Option value="statusCode">状态码</Select.Option>
               <Select.Option value="responseHeader">响应头</Select.Option>
             </Select>
          </Form.Item>
          <Form.Item name="compareCondition" label="比对条件">
             <Select placeholder="请选择">
               <Select.Option value="none">不验证</Select.Option>
               <Select.Option value="equal">等于</Select.Option>
               <Select.Option value="notEqual">不等于</Select.Option>
               <Select.Option value="contain">包含</Select.Option>
               <Select.Option value="notContain">不包含</Select.Option>
               <Select.Option value="gt">大于</Select.Option>
               <Select.Option value="lt">小于</Select.Option>
             </Select>
          </Form.Item>
          <Form.Item name="expectedCompareValue" label="预期比对值">
             <Input placeholder="时间 (单位：毫秒)" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <Modal
      title={initialValues?.id ? "修改" : "新增"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.validateFields().then(onOk)}
      width={700}
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}>
        <Tabs defaultActiveKey="1" items={items} />
        
        <Form.Item name="validationType" label="验证值类型">
          <Select>
            <Select.Option value="constant">常量</Select.Option>
            <Select.Option value="variable">变量</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="expectedValue" label="预期结果比对验证值">
          <Input.TextArea placeholder="可使用变量、全局变量、入参节点值、正则表达式来进行比对验证" rows={3} />
        </Form.Item>

        <Form.Item name="status" label="状态">
          <Select>
            <Select.Option value="active">有效</Select.Option>
            <Select.Option value="inactive">无效</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input placeholder="请输入备注" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 7. Validation Rules List Modal
interface ValidationRulesModalProps {
  open: boolean;
  onCancel: () => void;
  sceneName: string;
  sceneId: string;
  rulesList: ValidationRule[];
}

const ValidationRulesModal: React.FC<ValidationRulesModalProps> = ({
  open,
  onCancel,
  sceneName,
  sceneId,
  rulesList,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ValidationRule | undefined>(undefined);

  const handleAdd = () => {
    setEditingRule(undefined);
    setFormModalOpen(true);
  };

  const handleEdit = (record: ValidationRule) => {
    setEditingRule(record);
    setFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    sceneStore.removeValidationRule(sceneId, [id]);
    message.success('删除成功');
  };

  const handleBatchDelete = () => {
    if (!selectedRowKeys.length) return;
    sceneStore.removeValidationRule(sceneId, selectedRowKeys as string[]);
    setSelectedRowKeys([]);
    message.success('批量删除成功');
  };

  const handleFormOk = (values: Partial<ValidationRule>) => {
    if (editingRule) {
      sceneStore.updateValidationRule(sceneId, editingRule.id, values);
      message.success('修改成功');
    } else {
      sceneStore.addValidationRule(sceneId, values);
      message.success('新增成功');
    }
    setFormModalOpen(false);
  };

  const columns: ColumnsType<ValidationRule> = [
    { title: '标识', dataIndex: 'name', width: 60, align: 'center' },
    { 
      title: '验证方式', 
      dataIndex: 'type', 
      width: 100,
      render: (val) => {
        const map: Record<string, string> = { node: '节点验证', custom: '自定义验证' };
        return <Tag>{map[val] || val}</Tag>;
      }
    },
    { title: '节点路径/关联规则', dataIndex: 'pathOrRule', width: 150, ellipsis: true },
    { 
      title: '预期验证值类型', 
      dataIndex: 'expectedType', 
      width: 100,
      render: (val) => {
        const map: Record<string, string> = { constant: '常量', variable: '变量' };
        return <Tag color="blue">{map[val] || val}</Tag>;
      }
    },
    { title: '对比条件', dataIndex: 'compareCondition', width: 80 },
    { title: '预期值', dataIndex: 'expectedValue', width: 150, ellipsis: true },
    { 
      title: '状态', 
      dataIndex: 'status', 
      width: 80, 
      align: 'center',
      render: (status) => <Tag color={status === 'active' ? 'blue' : 'red'}>{status === 'active' ? '正常' : '无效'}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>修改</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
             <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={`${sceneName} 的验证规则`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" onClick={handleAdd}>新增</Button>
          <Button danger onClick={handleBatchDelete}>批量删除</Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rulesList}
        pagination={{ pageSize: 5 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        size="small"
      />
      
      <ValidationRuleFormModal
        open={formModalOpen}
        onCancel={() => setFormModalOpen(false)}
        onOk={handleFormOk}
        initialValues={editingRule}
      />
    </Modal>
  );
};


// --- Main Page Component ---

export default function SceneManagementPage() {
  const { scenes } = useSyncExternalStore(sceneStore.subscribe, sceneStore.getSnapshot, sceneStore.getServerSnapshot);
  const { messages } = useSyncExternalStore(messageStore.subscribe, messageStore.getSnapshot, messageStore.getServerSnapshot);
  
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Sub-modal states
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [testDataModalOpen, setTestDataModalOpen] = useState(false);
  const [validationRulesModalOpen, setValidationRulesModalOpen] = useState(false);
  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  
  // Temp state
  const [currentEnvIds, setCurrentEnvIds] = useState<string[]>([]);
  const [currentScene, setCurrentScene] = useState<SceneType | null>(null);

  // Search logic
  const [filteredScenes, setFilteredScenes] = useState<SceneType[]>(scenes);
  
  React.useEffect(() => {
    setFilteredScenes(scenes);
    // Update current scene if open
    if (currentScene) {
      const updated = scenes.find(s => s.id === currentScene.id);
      if (updated) setCurrentScene(updated);
    }
  }, [scenes, currentScene]);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const name = values.name?.trim().toLowerCase();
    
    let result = scenes;
    if (name) {
      result = result.filter(item => item.name.toLowerCase().includes(name));
    }
    setFilteredScenes(result);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredScenes(scenes);
  };

  // Add/Edit logic
  const handleAdd = () => {
    setModalTitle('新增');
    setEditingId(null);
    form.resetFields();
    setCurrentEnvIds([]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: SceneType) => {
    setModalTitle('修改');
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      environmentDisplay: record.environmentIds.join(', '), 
    });
    setCurrentEnvIds(record.environmentIds);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    sceneStore.removeScenes([id]);
    message.success('删除成功');
  };

  const handleBatchDelete = () => {
    message.info('批量删除功能暂未实现');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        environmentIds: currentEnvIds,
      };
      
      delete payload.environmentDisplay;

      if (editingId) {
        sceneStore.updateScene(editingId, payload);
        message.success('修改成功');
      } else {
        sceneStore.createScene(payload);
        message.success('新增成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Columns
  const columns: ColumnsType<SceneType> = [
    { title: '场景ID', dataIndex: 'id', width: 80, align: 'center', sorter: (a, b) => Number(a.id) - Number(b.id) },
    { title: '所属接口', dataIndex: 'interfaceName', width: 180, ellipsis: true },
    { title: '所属报文', dataIndex: 'messageName', width: 180, ellipsis: true },
    { title: '场景名称', dataIndex: 'name', width: 200, ellipsis: true },
    { 
      title: '测试数据', 
      dataIndex: 'testDataCount', 
      width: 90, 
      align: 'center',
      render: (count, record) => (
        <Button 
          type="link" 
          size="small" 
          onClick={() => {
            setCurrentScene(record);
            setTestDataModalOpen(true);
          }}
        >
          {count}
        </Button>
      )
    },
    { 
      title: '验证规则', 
      dataIndex: 'validationRuleCount', 
      width: 90, 
      align: 'center',
      render: (count, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => {
            setCurrentScene(record);
            setValidationRulesModalOpen(true);
          }}
        >
          {count}
        </Button>
      )
    },
    { 
      title: '出参示例', 
      key: 'example', 
      width: 90, 
      align: 'center',
      render: () => <Button type="link" size="small">出参示例</Button>
    },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    { title: '所属测试环境', dataIndex: 'environmentIds', width: 150, ellipsis: true, render: (ids: string[]) => ids.join(',') }, // Mock display
    { title: '请求路径', dataIndex: 'requestPath', width: 200, ellipsis: true },
    { 
      title: '当前状态', 
      dataIndex: 'status', 
      width: 80, 
      align: 'center',
      render: (status) => <Tag color={status === 'active' ? 'blue' : 'red'}>{status === 'active' ? '有效' : '无效'}</Tag>
    },
    { title: '所属项目', dataIndex: 'projectName', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            onClick={() => {
              setCurrentScene(record);
              setExecuteModalOpen(true);
            }}
          >
            执行
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>修改</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="场景管理">
      <div className="p-4">
        {/* Search Area */}
        <Card bordered={false} style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px 24px' }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="name" label="场景名称">
              <Input placeholder="请输入场景名称" allowClear style={{ width: 200 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Table Area */}
        <Card bordered={false} bodyStyle={{ padding: '16px 24px 24px' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
              <Button onClick={() => message.info('导出功能暂未实现')}>导出</Button>
              <Button danger onClick={handleBatchDelete}>批量删除</Button>
            </Space>
          </div>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredScenes}
            pagination={{ showSizeChanger: true, showQuickJumper: true, total: filteredScenes.length }}
            scroll={{ x: 1800 }}
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={modalTitle}
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={() => setIsModalOpen(false)}
          width={800}
          forceRender
        >
          <Form form={form} layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 18 }}>
            <Form.Item name="projectName" label="所属项目">
              <Input disabled placeholder="点击选择项目" />
            </Form.Item>

            <Form.Item label="报文名称" required>
              <Space>
                <Form.Item 
                  name="messageName" 
                  noStyle 
                  rules={[{ required: true, message: '请选择报文' }]}
                >
                  <Input readOnly placeholder="请选择报文" style={{ width: 300 }} />
                </Form.Item>
                <Button type="primary" onClick={() => setMessageModalOpen(true)}>选择</Button>
              </Space>
              {/* Hidden fields to store related info */}
              <Form.Item name="messageId" hidden><Input /></Form.Item>
              <Form.Item name="interfaceId" hidden><Input /></Form.Item>
              <Form.Item name="interfaceName" hidden><Input /></Form.Item>
            </Form.Item>

            <Form.Item name="name" label="场景名称" rules={[{ required: true, message: '请输入场景名称' }]}>
              <Input placeholder="场景名称" />
            </Form.Item>

            <Form.Item label="所属测试环境" required>
              <Space>
                <Input 
                  readOnly 
                  placeholder="请选择测试环境" 
                  value={currentEnvIds.join(',')} 
                  style={{ width: 300 }} 
                />
                <Button type="primary" onClick={() => setEnvModalOpen(true)}>选择</Button>
              </Space>
            </Form.Item>

            <Form.Item name="requestPath" label="请求路径" help="你可以单独给此场景设置请求路径，该路径的优先级大于接口和报文中设置的请求路径">
              <Input placeholder="请求路径" />
            </Form.Item>

            <Form.Item name="returnExample" label="返回示例报文">
              <Input.TextArea 
                rows={4} 
                placeholder="返回示例报文" 
              />
            </Form.Item>

            <Form.Item name="status" label="当前状态" initialValue="active" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="active">有效</Radio>
                <Radio value="inactive">无效</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input placeholder="备注" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Sub Modals */}
        <SelectMessageModal
          open={messageModalOpen}
          onCancel={() => setMessageModalOpen(false)}
          messages={messages}
          onSelect={(record) => {
            form.setFieldsValue({
              messageId: record.id,
              messageName: record.name,
              interfaceId: record.interfaceId,
              interfaceName: record.interfaceName,
              projectName: record.projectName,
              requestPath: record.requestPath || '', // Pre-fill path if available
            });
          }}
        />

        <SelectEnvironmentModal
          open={envModalOpen}
          onCancel={() => setEnvModalOpen(false)}
          onOk={(ids) => {
            setCurrentEnvIds(ids);
            setEnvModalOpen(false);
          }}
          initialValues={currentEnvIds}
        />
        
        <ExecuteSceneModal
          open={executeModalOpen}
          onCancel={() => {
            setExecuteModalOpen(false);
            setCurrentScene(null);
          }}
          scene={currentScene}
        />

        {currentScene && (
          <>
            <TestDataModal
              open={testDataModalOpen}
              onCancel={() => {
                setTestDataModalOpen(false);
                setCurrentScene(null);
              }}
              sceneName={currentScene.name}
              sceneId={currentScene.id}
              dataList={currentScene.testDataList || []}
            />
            <ValidationRulesModal
              open={validationRulesModalOpen}
              onCancel={() => {
                setValidationRulesModalOpen(false);
                setCurrentScene(null);
              }}
              sceneName={currentScene.name}
              sceneId={currentScene.id}
              rulesList={currentScene.validationRules || []}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}
