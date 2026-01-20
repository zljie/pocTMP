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
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps, UploadFile } from 'antd';
import MainLayout from '@/components/layout/MainLayout';

// 接口类型定义
interface InterfaceType {
  id: string;
  key: string;
  name: string; // 接口英文名
  name_cn: string; // 接口中文名
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'; // HTTP方法
  path: string; // 请求路径
  protocol: 'HTTP' | 'HTTPS'; // 协议
  status: 'active' | 'inactive'; // 状态
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
  paramIn: 'path' | 'body'; // 参数位置 (移除了 query 和 header)
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
const methodColorMap = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  DELETE: 'red',
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
    setIsModalOpen(true);
  };

  const handleEdit = (record: InterfaceType) => {
    setModalTitle('修改');
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
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
        // 获取项目名称
        const project = mockProjects.find(p => p.value === values.projectId);
        const projectName = project ? project.label : '';

        if (editingId) {
          setData((prev) =>
            prev.map((item) =>
              item.id === editingId
                ? { ...item, ...values, projectName }
                : item
            )
          );
          message.success('修改成功');
        } else {
          const newId = String(Math.max(...data.map(d => Number(d.id)), 0) + 1);
          const newItem: InterfaceType = {
            id: newId,
            key: newId,
            ...values,
            projectName,
            parameterCount: 0, // 默认为0
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

  // 获取动态参数位置选项
  const getParamInOptions = (method?: string) => {
    const options = [
      { label: '路径参数 (Path)', value: 'path' },
    ];
    
    // 只有 POST/PUT 支持 Body 参数
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
      width: 90,
      align: 'center',
      render: (method: keyof typeof methodColorMap) => (
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
              name="method"
              label="请求方法"
              rules={[{ required: true, message: '请选择请求方法' }]}
            >
              <Select placeholder="选择" options={[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'DELETE', value: 'DELETE' },
              ]} />
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
              <Select placeholder="选择" options={[
                { label: 'HTTP协议', value: 'HTTP' },
                { label: 'HTTPS协议', value: 'HTTPS' },
              ]} />
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
               <Select placeholder="选择类型" options={[
                 { label: 'String', value: 'String' },
                 { label: 'Integer', value: 'Integer' },
                 { label: 'Boolean', value: 'Boolean' },
                 { label: 'Object', value: 'Object' },
                 { label: 'Array', value: 'Array' },
               ]} />
            </Form.Item>
            <Form.Item name="remark" label="备注">
              <Input.TextArea placeholder="备注" rows={2} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
}
