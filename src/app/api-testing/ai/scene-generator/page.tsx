'use client';

import React, { useState, useSyncExternalStore, useMemo } from 'react';
import {
  Button,
  Card,
  Steps,
  Table,
  Space,
  Checkbox,
  Typography,
  Tag,
  message,
  Alert,
  Progress,
  List,
  Row,
  Col,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  RocketOutlined,
  SaveOutlined,
  LeftOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import MainLayout from '@/components/layout/MainLayout';
import { useRouter } from 'next/navigation';
import messageStore, { InterfaceType, MessageType } from '@/stores/messageStore';
import sceneStore from '@/stores/sceneStore';
import { postJson } from '@/lib/ai/client';

const { Title, Text, Paragraph } = Typography;

// --- Types ---

type GenerationCategory = 'normal' | 'exception' | 'auth' | 'boundary';

interface AiScenario {
  name: string;
  category: GenerationCategory | string;
  requestExample?: string;
  assertions?: string[];
  notes?: string;
}

interface GeneratedResult {
  interfaceId: string;
  interfaceName: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  scenarios: AiScenario[];
}

// --- Components ---

export default function AiSceneGeneratorPage() {
  const router = useRouter();
  
  // Stores
  const { interfaces, messages } = useSyncExternalStore(
    messageStore.subscribe,
    messageStore.getSnapshot,
    messageStore.getServerSnapshot
  );

  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterfaceIds, setSelectedInterfaceIds] = useState<React.Key[]>([]);
  
  const [options, setOptions] = useState<GenerationCategory[]>(['normal', 'exception', 'auth', 'boundary']);
  
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Selection in Preview Step
  // Map of interfaceId -> Set of selected scenario indices
  const [selectedScenarios, setSelectedScenarios] = useState<Record<string, number[]>>({});

  // --- Helpers ---

  const getInterfaceById = (id: string) => interfaces.find((i) => i.id === id);

  // --- Handlers ---

  const handleNext = () => {
    if (currentStep === 0 && selectedInterfaceIds.length === 0) {
      message.warning('请至少选择一个接口');
      return;
    }
    
    if (currentStep === 0) {
      // Initialize results placeholder
      const initialResults: GeneratedResult[] = selectedInterfaceIds.map((id) => {
        const iface = getInterfaceById(id as string);
        return {
          interfaceId: id as string,
          interfaceName: iface?.name_cn || iface?.name || 'Unknown',
          status: 'pending',
          scenarios: [],
        };
      });
      setResults(initialResults);
    }
    
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const startGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    const newResults = [...results];
    const total = newResults.length;
    let completed = 0;

    for (let i = 0; i < total; i++) {
      const item = newResults[i];
      const iface = getInterfaceById(item.interfaceId);
      
      // Update status to loading
      newResults[i] = { ...item, status: 'loading' };
      setResults([...newResults]);

      if (!iface) {
        newResults[i] = { ...item, status: 'error', error: '接口不存在' };
        completed++;
        setProgress(Math.round((completed / total) * 100));
        setResults([...newResults]);
        continue;
      }

      try {
        // Construct goal based on options
        const goal = `基于该接口生成测试场景建议清单，需包含以下类型：${options.map(o => {
          const map: Record<string, string> = { normal: '正常场景', exception: '异常场景', auth: '鉴权场景', boundary: '边界测试' };
          return map[o] || o;
        }).join('、')}。`;

        // Call AI API
        const resp = await postJson<{ summary: string; scenarios: AiScenario[] }>(
            '/api/ai/interface-testing/scene-generation/',
            {
              goal,
              interfaceName: iface.name_cn || iface.name,
              method: 'POST', // Mock method as interface definition might lack it or we need to find it
              path: iface.path,
              params: {}, // In a real app, we would fetch params definition here
              context: `项目：${iface.projectName}`,
            }
        );

        if ('error' in resp) {
          newResults[i] = { ...item, status: 'error', error: resp.error.message };
        } else {
          newResults[i] = { 
            ...item, 
            status: 'success', 
            scenarios: resp.result.scenarios || [] 
          };
          
          // Default select all generated scenarios
          setSelectedScenarios(prev => ({
            ...prev,
            [item.interfaceId]: resp.result.scenarios.map((_, idx) => idx)
          }));
        }
      } catch (err: any) {
        newResults[i] = { ...item, status: 'error', error: err.message || 'Unknown error' };
      }

      completed++;
      setProgress(Math.round((completed / total) * 100));
      setResults([...newResults]);
    }

    setIsGenerating(false);
    handleNext(); // Move to preview step
  };

  const handleSave = () => {
    let savedCount = 0;
    
    results.forEach(res => {
        if (res.status !== 'success') return;
        
        const indices = selectedScenarios[res.interfaceId] || [];
        if (indices.length === 0) return;

        const iface = getInterfaceById(res.interfaceId);
        if (!iface) return;

        // Find or create a message for this interface
        // For simplicity, we try to find an existing one, or create a placeholder one if logic allowed.
        // Here we just pick the first one or create a dummy one logic.
        let targetMessageId = '';
        let targetMessageName = '';
        
        const existingMessage = messages.find(m => m.interfaceId === iface.id && m.status === 'active');
        if (existingMessage) {
            targetMessageId = existingMessage.id;
            targetMessageName = existingMessage.name;
        } else {
            // In a real scenario, we might want to create one. 
            // For now, let's assume we can create a "Default Message"
            const newMessage = messageStore.createMessage({
                name: `${iface.name}_DefaultMessage`,
                type: 'JSON',
                interfaceId: iface.id,
                interfaceName: iface.name_cn || iface.name,
                status: 'active',
                sceneCount: 0,
                projectId: 'p1', // Mock project
                projectName: iface.projectName,
                createNormalScene: true,
            });
            targetMessageId = newMessage.id;
            targetMessageName = newMessage.name;
        }

        indices.forEach(idx => {
            const scenario = res.scenarios[idx];
            sceneStore.createScene({
                name: scenario.name,
                messageId: targetMessageId,
                messageName: targetMessageName,
                interfaceId: iface.id,
                interfaceName: iface.name_cn || iface.name,
                status: 'active',
                testDataCount: 0,
                validationRuleCount: 0,
                projectId: 'p1', // Mock
                projectName: iface.projectName,
                environmentIds: [], // Default empty
                requestPath: iface.path,
                remark: `AI生成 (${scenario.category}): ${scenario.notes || ''}`,
                returnExample: scenario.requestExample, // Using request example as placeholder or return example
            });
            savedCount++;
        });
    });

    message.success(`成功保存 ${savedCount} 个场景！`);
    router.push('/api-testing/scene');
  };

  // --- Step Content Renderers ---

  const renderStep1 = () => {
    const columns: ColumnsType<InterfaceType> = [
      { title: '接口ID', dataIndex: 'id', width: 80 },
      { title: '接口名称', dataIndex: 'name_cn', render: (t, r) => t || r.name },
      { title: '路径', dataIndex: 'path' },
      { title: '项目', dataIndex: 'projectName', width: 150 },
    ];

    return (
      <Card title="选择接口" bordered={false}>
        <Alert message="请选择需要生成测试场景的接口，支持多选。" type="info" showIcon style={{ marginBottom: 16 }} />
        
        <div style={{ marginBottom: 16 }}>
            <Input 
                prefix={<SearchOutlined />} 
                placeholder="搜索接口名称或路径" 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
            />
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredInterfaces}
          rowSelection={{
            selectedRowKeys: selectedInterfaceIds,
            onChange: setSelectedInterfaceIds,
          }}
          pagination={{ pageSize: 10 }}
        />
        <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button type="primary" onClick={handleNext} disabled={selectedInterfaceIds.length === 0}>
                下一步
            </Button>
        </div>
      </Card>
    );
  };

  const renderStep2 = () => {
    return (
      <Card title="生成配置" bordered={false}>
        <Row gutter={24}>
          <Col span={12}>
             <div style={{ marginBottom: 24 }}>
                <Title level={5}>1. 确认选中的接口 ({selectedInterfaceIds.length} 个)</Title>
                <List
                    size="small"
                    bordered
                    dataSource={results}
                    renderItem={(item) => (
                        <List.Item>
                            <Text ellipsis>{item.interfaceName}</Text>
                            {item.status === 'loading' && <LoadingOutlined />}
                            {item.status === 'success' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            {item.status === 'error' && <Text type="danger">失败</Text>}
                        </List.Item>
                    )}
                    style={{ maxHeight: 300, overflowY: 'auto' }}
                />
             </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 24 }}>
                <Title level={5}>2. 选择场景生成策略</Title>
                <Checkbox.Group
                    options={[
                        { label: '正常场景 (Happy Path)', value: 'normal' },
                        { label: '异常场景 (Exception)', value: 'exception' },
                        { label: '鉴权测试 (Auth)', value: 'auth' },
                        { label: '边界测试 (Boundary)', value: 'boundary' },
                    ]}
                    value={options}
                    onChange={(vals) => setOptions(vals as GenerationCategory[])}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                />
            </div>
            
            {isGenerating && (
                <div style={{ marginBottom: 24 }}>
                    <Text>生成进度：</Text>
                    <Progress percent={progress} status="active" />
                </div>
            )}
          </Col>
        </Row>

        <Divider />
        
        <div style={{ textAlign: 'right' }}>
            <Space>
                <Button onClick={handlePrev} disabled={isGenerating}>上一步</Button>
                <Button 
                    type="primary" 
                    icon={<RocketOutlined />} 
                    onClick={startGeneration} 
                    loading={isGenerating}
                >
                    {isGenerating ? '正在生成中...' : '开始生成'}
                </Button>
            </Space>
        </div>
      </Card>
    );
  };

  const renderStep3 = () => {
    return (
      <Card title="预览与保存" bordered={false}>
         <Alert 
            message={`共生成 ${results.reduce((acc, curr) => acc + (curr.scenarios?.length || 0), 0)} 个场景建议。请勾选需要保存的场景。`} 
            type="success" 
            showIcon 
            style={{ marginBottom: 16 }} 
         />

         {results.map(res => (
             <Card 
                key={res.interfaceId} 
                type="inner" 
                title={`${res.interfaceName} (${res.scenarios.length})`}
                style={{ marginBottom: 16 }}
                size="small"
             >
                {res.status === 'error' ? (
                    <Text type="danger">{res.error}</Text>
                ) : (
                    <Table
                        rowKey={(r) => r.name}
                        dataSource={res.scenarios}
                        pagination={false}
                        size="small"
                        rowSelection={{
                            selectedRowKeys: (selectedScenarios[res.interfaceId] || []).map(idx => res.scenarios[idx].name),
                            onChange: (keys) => {
                                // Map names back to indices
                                const indices = res.scenarios
                                    .map((s, idx) => keys.includes(s.name) ? idx : -1)
                                    .filter(i => i !== -1);
                                setSelectedScenarios(prev => ({
                                    ...prev,
                                    [res.interfaceId]: indices
                                }));
                            }
                        }}
                        columns={[
                            { title: '场景名称', dataIndex: 'name', width: 250 },
                            { title: '类型', dataIndex: 'category', width: 100, render: t => <Tag>{t}</Tag> },
                            { title: '断言', dataIndex: 'assertions', render: (v: string[]) => v?.join(', '), ellipsis: true },
                            { title: '备注', dataIndex: 'notes', ellipsis: true },
                        ]}
                    />
                )}
             </Card>
         ))}

        <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
                <Button onClick={() => setCurrentStep(1)}>返回配置</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                    一键保存至场景列表
                </Button>
            </Space>
        </div>
      </Card>
    );
  };

  return (
    <MainLayout title="智能场景生成">
      <div className="p-4">
        <Card bordered={false} style={{ marginBottom: 24 }}>
            <Steps
                current={currentStep}
                items={[
                    { title: '选择接口', description: '选择需要生成场景的接口' },
                    { title: '生成配置', description: '配置生成策略并执行' },
                    { title: '预览与保存', description: '确认结果并入库' },
                ]}
            />
        </Card>
        
        {currentStep === 0 && renderStep1()}
        {currentStep === 1 && renderStep2()}
        {currentStep === 2 && renderStep3()}
      </div>
    </MainLayout>
  );
}
