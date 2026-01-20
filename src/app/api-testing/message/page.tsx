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
  Tabs,
  InputNumber,
  Tree,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import messageStore, { MessageType, InterfaceType, HeaderConfig } from '@/stores/messageStore';

// --- Sub-Components ---

// 1. Select Interface Modal
interface SelectInterfaceModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (record: InterfaceType) => void;
  interfaces: InterfaceType[];
}

const SelectInterfaceModal: React.FC<SelectInterfaceModalProps> = ({
  open,
  onCancel,
  onSelect,
  interfaces,
}) => {
  const [searchText, setSearchText] = useState('');
  
  const filteredData = interfaces.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name_cn.includes(searchText)
  );

  const columns: ColumnsType<InterfaceType> = [
    { title: '接口ID', dataIndex: 'id', width: 80 },
    { title: '接口英文名', dataIndex: 'name', width: 180 },
    { title: '接口中文名', dataIndex: 'name_cn', width: 180 },
    { title: '请求路径', dataIndex: 'path', width: 200 },
    { title: '接口类型', dataIndex: 'type', width: 100 },
    { title: '接口协议', dataIndex: 'protocol', width: 100 },
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
      title="请选择接口"
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      <Space style={{ marginBottom: 16 }}>
        <Input 
          placeholder="接口英文名" 
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

// 2. Header Config Modal
interface HeaderConfigModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: HeaderConfig) => void;
  initialValues?: HeaderConfig;
}

const HeaderConfigModal: React.FC<HeaderConfigModalProps> = ({
  open,
  onCancel,
  onOk,
  initialValues,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || {
        headers: [],
        querys: [],
        authorization: [],
        method: undefined,
        connectTimeOut: '',
        readTimeOut: '',
        recEncType: '',
        encType: '',
      });
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      title="报文头参数配置"
      open={open}
      onCancel={onCancel}
      onOk={() => form.validateFields().then(onOk)}
      width={800}
      okText="保存更改"
      cancelText="取消"
    >
      <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
        {/* Simplified for demo: Using JSON text areas or dynamic lists would be better, but following screenshot style */}
        <Form.Item label="Headers">
          <Button type="dashed" style={{ width: '100%' }}>+ New Header</Button>
          {/* Real implementation would use Form.List */}
        </Form.Item>
        <Form.Item label="Querys">
          <Button type="dashed" style={{ width: '100%' }}>+ New Query</Button>
        </Form.Item>
        <Form.Item label="Authorization">
          <Button type="dashed" style={{ width: '100%' }}>+ New Authorization</Button>
        </Form.Item>
        
        <Form.Item name="method" label="Method">
          <Select placeholder="请选择">
            <Select.Option value="GET">GET</Select.Option>
            <Select.Option value="POST">POST</Select.Option>
            <Select.Option value="PUT">PUT</Select.Option>
            <Select.Option value="DELETE">DELETE</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="connectTimeOut" label="ConnectTimeOut">
          <Input placeholder="ConnectTimeOut" />
        </Form.Item>
        <Form.Item name="readTimeOut" label="ReadTimeOut">
          <Input placeholder="ReadTimeOut" />
        </Form.Item>
        <Form.Item name="recEncType" label="RecEncType">
          <Input placeholder="RecEncType" />
        </Form.Item>
        <Form.Item name="encType" label="EncType">
          <Input placeholder="EncType" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 3. Select Nodes Modal (Mock)
interface SelectNodesModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (nodeIds: string[]) => void;
  initialNodeIds?: string[];
}

const SelectNodesModal: React.FC<SelectNodesModalProps> = ({
  open,
  onCancel,
  onOk,
  initialNodeIds,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  
  React.useEffect(() => {
    if (open) {
      setSelectedKeys(initialNodeIds || []);
    }
  }, [open, initialNodeIds]);

  // Mock tree data
  const treeData = [
    {
      title: '节点',
      key: 'root',
      children: [
        { title: '用户ID', key: 'userId' },
        { title: '用户Key', key: 'userKey' },
        { title: '测试', key: 'test' },
      ],
    },
  ];

  // Mock detail view
  const renderDetail = () => {
    if (selectedKeys.length === 0) return <div style={{ padding: 20, color: '#999' }}>请选择节点</div>;
    const key = selectedKeys[selectedKeys.length - 1];
    return (
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="参数ID">26</Descriptions.Item>
        <Descriptions.Item label="参数标识">{key}</Descriptions.Item>
        <Descriptions.Item label="参数名">示例参数</Descriptions.Item>
        <Descriptions.Item label="节点路径">TopRoot</Descriptions.Item>
        <Descriptions.Item label="节点类型">String</Descriptions.Item>
        <Descriptions.Item label="默认值">-</Descriptions.Item>
        <Descriptions.Item label="备注">-</Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <Modal
      title="选择该报文包含的节点"
      open={open}
      onCancel={onCancel}
      onOk={() => onOk(selectedKeys)}
      width={800}
      okText="保存更改"
      cancelText="取消"
    >
      <Row gutter={16}>
        <Col span={12} style={{ borderRight: '1px solid #f0f0f0' }}>
          <Tree
            checkable
            defaultExpandAll
            treeData={treeData}
            checkedKeys={selectedKeys}
            onCheck={(keys) => setSelectedKeys(keys as string[])}
          />
        </Col>
        <Col span={12}>
          {renderDetail()}
        </Col>
      </Row>
    </Modal>
  );
};


// --- Main Page Component ---

export default function MessageManagementPage() {
  const { messages, interfaces } = useSyncExternalStore(messageStore.subscribe, messageStore.getSnapshot, messageStore.getServerSnapshot);
  
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Sub-modal states
  const [interfaceModalOpen, setInterfaceModalOpen] = useState(false);
  const [headerConfigModalOpen, setHeaderConfigModalOpen] = useState(false);
  const [nodesModalOpen, setNodesModalOpen] = useState(false);
  
  // Temp state for header config
  const [currentHeaderConfig, setCurrentHeaderConfig] = useState<HeaderConfig | undefined>(undefined);
  const [currentNodeIds, setCurrentNodeIds] = useState<string[]>([]);

  // Search logic
  const [filteredMessages, setFilteredMessages] = useState<MessageType[]>(messages);
  
  React.useEffect(() => {
    setFilteredMessages(messages);
  }, [messages]);

  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const name = values.name?.trim().toLowerCase();
    
    let result = messages;
    if (name) {
      result = result.filter(item => item.name.toLowerCase().includes(name));
    }
    setFilteredMessages(result);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setFilteredMessages(messages);
  };

  // Add/Edit logic
  const handleAdd = () => {
    setModalTitle('新增');
    setEditingId(null);
    form.resetFields();
    setCurrentHeaderConfig(undefined);
    setCurrentNodeIds([]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: MessageType) => {
    setModalTitle('修改');
    setEditingId(record.id);
    form.setFieldsValue(record);
    setCurrentHeaderConfig(record.headerConfig);
    setCurrentNodeIds(record.nodeIds || []);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    messageStore.removeMessages([id]);
    message.success('删除成功');
  };

  const handleBatchDelete = () => {
    // Implement batch delete logic if needed
    message.info('批量删除功能暂未实现');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        headerConfig: currentHeaderConfig,
        nodeIds: currentNodeIds,
      };

      if (editingId) {
        messageStore.updateMessage(editingId, payload);
        message.success('修改成功');
      } else {
        messageStore.createMessage(payload);
        message.success('新增成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Columns
  const columns: ColumnsType<MessageType> = [
    { title: '报文ID', dataIndex: 'id', width: 80, align: 'center' },
    { title: '报文名称', dataIndex: 'name', width: 200 },
    { title: '类型', dataIndex: 'type', width: 100, align: 'center' },
    { title: '所属接口', dataIndex: 'interfaceName', width: 200 },
    { 
      title: '当前状态', 
      dataIndex: 'status', 
      width: 100, 
      align: 'center',
      render: (status) => <Tag color={status === 'active' ? 'blue' : 'red'}>{status === 'active' ? '有效' : '无效'}</Tag>
    },
    { 
      title: '场景管理', 
      dataIndex: 'sceneCount', 
      width: 100, 
      align: 'center',
      render: (count) => <Tag color="blue">{count}</Tag>
    },
    { title: '所属项目', dataIndex: 'projectName', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
    <MainLayout title="报文管理">
      <div className="p-4">
        {/* Search Area */}
        <Card bordered={false} style={{ marginBottom: 12 }} styles={{ body: { padding: '16px 24px' } }}>
          <Form form={searchForm} layout="inline">
            <Form.Item name="name" label="报文名称">
              <Input placeholder="请输入报文名称" allowClear style={{ width: 200 }} />
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
        <Card bordered={false} styles={{ body: { padding: '16px 24px 24px' } }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
              <Button danger onClick={handleBatchDelete}>批量删除</Button>
            </Space>
          </div>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredMessages}
            pagination={{ showSizeChanger: true, showQuickJumper: true, total: filteredMessages.length }}
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
            <Form.Item name="name" label="报文名称" rules={[{ required: true, message: '请输入报文名称' }]}>
              <Input placeholder="报文名称" />
            </Form.Item>
            
            <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
              <Select placeholder="请选择">
                <Select.Option value="XML">XML</Select.Option>
                <Select.Option value="URL">URL</Select.Option>
                <Select.Option value="JSON">JSON</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="所属接口" required>
              <Space>
                <Form.Item 
                  name="interfaceName" 
                  noStyle 
                  rules={[{ required: true, message: '请选择所属接口' }]}
                >
                  <Input readOnly placeholder="请选择所属接口" style={{ width: 300 }} />
                </Form.Item>
                <Button type="primary" onClick={() => setInterfaceModalOpen(true)}>选择</Button>
              </Space>
              {/* Hidden fields to store related interface info */}
              <Form.Item name="interfaceId" hidden><Input /></Form.Item>
              <Form.Item name="projectName" hidden><Input /></Form.Item>
            </Form.Item>

            <Form.Item label="报文头参数配置">
              <Space>
                <Button onClick={() => setHeaderConfigModalOpen(true)}>配置</Button>
                <Button>模板</Button>
              </Space>
            </Form.Item>

            <Form.Item name="requestPath" label="请求路径">
              <Input placeholder="请求路径" />
            </Form.Item>

            <Form.Item label="完整入参报文">
              <Space style={{ marginBottom: 8 }}>
                <Button onClick={() => setNodesModalOpen(true)}>选择</Button>
                <Button>验证</Button>
                <Button>格式化</Button>
              </Space>
              <Form.Item name="body" noStyle>
                <Input.TextArea 
                  rows={4} 
                  placeholder="只有当报文类型为自定义格式时可手动填写。" 
                />
              </Form.Item>
            </Form.Item>

            <Form.Item name="status" label="当前状态" initialValue="active" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="active">有效</Radio>
                <Radio value="inactive">无效</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="createNormalScene" label="创建正常场景" valuePropName="checked" initialValue={true}>
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="projectName" label="所属项目">
              <Input disabled placeholder="点击选择项目" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Sub Modals */}
        <SelectInterfaceModal
          open={interfaceModalOpen}
          onCancel={() => setInterfaceModalOpen(false)}
          interfaces={interfaces}
          onSelect={(record) => {
            form.setFieldsValue({
              interfaceId: record.id,
              interfaceName: record.name_cn || record.name,
              projectName: record.projectName,
              requestPath: record.path,
            });
          }}
        />

        <HeaderConfigModal
          open={headerConfigModalOpen}
          onCancel={() => setHeaderConfigModalOpen(false)}
          onOk={(config) => {
            setCurrentHeaderConfig(config);
            setHeaderConfigModalOpen(false);
          }}
          initialValues={currentHeaderConfig}
        />

        <SelectNodesModal
          open={nodesModalOpen}
          onCancel={() => setNodesModalOpen(false)}
          onOk={(keys) => {
            setCurrentNodeIds(keys);
            setNodesModalOpen(false);
          }}
          initialNodeIds={currentNodeIds}
        />
      </div>
    </MainLayout>
  );
}
