'use client';

import dayjs from 'dayjs';

export type SceneStatus = 'active' | 'inactive';

export interface SceneTestData {
  id: string;
  mark: string; // 标记
  environmentIds?: string[]; // 可用于的测试环境
  content?: string; // 数据内容
  type: 'reusable' | 'one-time'; // 数据类型：可重复使用 | 一次性数据
  status: 'active' | 'inactive' | 'used' | 'occupied'; // 状态
  autoExecute: boolean; // 场景自动执行
  isDefault: boolean; // 默认数据
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

export interface ValidationRule {
  id: string;
  name: string; // 标识
  type: 'node' | 'custom'; // 验证方式：节点验证 | 自定义验证
  pathOrRule: string; // 节点路径/关联规则
  expectedType: 'constant' | 'variable'; // 预期验证值类型
  compareCondition?: string; // 对比条件
  expectedValue: string; // 预期值
  status: 'active' | 'inactive';
  remark?: string;
  // Advanced fields
  leftBoundary?: string;
  rightBoundary?: string;
  offsetChars?: string;
  fetchOrder?: string;
  fetchLength?: string;
  validationType?: string; // 验证值类型 (常量/变量等)
  comparisonOperator?: string; // 对比条件
  expectedCompareType?: string; // 自定义验证：预期比对值类型
  expectedCompareValue?: string; // 自定义验证：预期比对值
}

export interface SceneType {
  id: string;
  name: string;
  messageId: string;
  messageName: string;
  interfaceId: string; // Derived from message
  interfaceName: string; // Derived from message
  status: SceneStatus;
  testDataCount: number;
  validationRuleCount: number;
  projectId: string;
  projectName: string;
  environmentIds: string[]; // 所属测试环境
  requestPath?: string;
  returnExample?: string;
  remark?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
  testDataList?: SceneTestData[]; // Mock inner data
  validationRules?: ValidationRule[]; // Mock inner data
}

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const getNextId = (items: Array<{ id: string }>) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

// Mock Scenes Data (based on screenshot 1)
const initialScenes: SceneType[] = [
  {
    id: '36',
    name: 'NQueryYigoFlatUDataByKey01',
    messageId: '21',
    messageName: 'NQueryYigoFlatUDataByKey01',
    interfaceId: '9',
    interfaceName: '通过用户id获取用户权限数据',
    status: 'active',
    testDataCount: 2,
    validationRuleCount: 3,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    environmentIds: ['hcm_op', 'hcm_login'], // Mock env IDs
    requestPath: '/FlatDataService/queryYigoFlatUDataByKey',
    remark: '正常返回值',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
    testDataList: [
      { id: '50', mark: '默认数据', status: 'active', isDefault: true, type: 'reusable', autoExecute: true, createTime: '2025-08-18 09:57:50', updatedTime: '2025-08-18 09:57:50', updatedBy: '管理员' },
      { id: '76', mark: '8503环境测试数据', status: 'active', isDefault: false, type: 'reusable', autoExecute: true, createTime: '2025-08-18 09:57:50', updatedTime: '2025-08-18 09:57:50', updatedBy: '管理员' },
    ],
    validationRules: [
      { id: '74', name: '0', type: 'node', pathOrRule: 'duReq...', expectedType: 'constant', expectedValue: '5c0b49...', status: 'active' },
      { id: '75', name: '0', type: 'node', pathOrRule: 'duReq...', expectedType: 'constant', expectedValue: 'TEST-F...', status: 'active' },
      { id: '76', name: '0', type: 'custom', pathOrRule: '状态码', expectedType: 'constant', compareCondition: '等于', expectedValue: '200', status: 'active' },
    ]
  },
  {
    id: '37',
    name: 'NQueryYigoFlatUDataByKey02',
    messageId: '21',
    messageName: 'NQueryYigoFlatUDataByKey01',
    interfaceId: '9',
    interfaceName: '通过用户id获取用户权限数据',
    status: 'active',
    testDataCount: 1,
    validationRuleCount: 2,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    environmentIds: ['hcm_op'],
    requestPath: '/FlatDataService/queryYigoFlatUDataByKey',
    remark: '返回具有用户...',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '38',
    name: 'NQueryYigoFlatUDataByKey03',
    messageId: '22',
    messageName: 'NQueryYigoFlatUDataByKey03',
    interfaceId: '9',
    interfaceName: '通过用户id获取用户权限数据',
    status: 'active',
    testDataCount: 1,
    validationRuleCount: 2,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    environmentIds: ['hcm_op'],
    requestPath: '/FlatDataService/queryYigoFlatUDataByKey',
    remark: '错误参数名',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '39',
    name: 'NQueryFlatMDataByEntryKey01',
    messageId: '23',
    messageName: 'NQueryFlatMDataByEntryKey01',
    interfaceId: '10',
    interfaceName: '通过菜单入口id获取菜单权限',
    status: 'active',
    testDataCount: 1,
    validationRuleCount: 3,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    environmentIds: ['hcm_op'],
    requestPath: '/FlatDataService/queryFlatMDataByEntryKey',
    remark: '正确返回响应值',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '40',
    name: 'NLogin-IT001',
    messageId: '24',
    messageName: 'NLogin-IT001',
    interfaceId: '11',
    interfaceName: '登录',
    status: 'active',
    testDataCount: 1,
    validationRuleCount: 2,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    environmentIds: ['hcm_login'],
    requestPath: '/authsso/login',
    remark: '登录成功',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

type SceneSnapshot = {
  scenes: SceneType[];
};

type CreateScenePayload = Omit<SceneType, 'id' | 'createTime' | 'updatedTime' | 'updatedBy'> & {
  updatedBy?: string;
};

type UpdateScenePayload = Partial<Omit<SceneType, 'id' | 'createTime'>> & { updatedBy?: string };

const sceneStore = (() => {
  let scenes: SceneType[] = initialScenes;
  let snapshot: SceneSnapshot = { scenes };
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getSnapshot = (): SceneSnapshot => {
    if (snapshot.scenes !== scenes) {
      snapshot = { scenes };
    }
    return snapshot;
  };

  const createScene = (payload: CreateScenePayload) => {
    const updatedTime = nowText();
    const id = getNextId(scenes);
    const record: SceneType = {
      id,
      ...payload,
      createTime: updatedTime,
      updatedTime,
      updatedBy: payload.updatedBy ?? '管理员',
      testDataList: [],
      validationRules: [],
    };
    scenes = [record, ...scenes];
    emit();
    return record;
  };

  const updateScene = (id: string, payload: UpdateScenePayload) => {
    const updatedTime = nowText();
    const updatedBy = payload.updatedBy ?? '管理员';
    let updatedRecord: SceneType | undefined;

    scenes = scenes.map((item) => {
      if (item.id !== id) return item;
      updatedRecord = {
        ...item,
        ...payload,
        updatedTime,
        updatedBy,
      };
      return updatedRecord;
    });

    emit();
    return updatedRecord;
  };

  const removeScenes = (ids: Array<string | number>) => {
    if (!ids.length) return;
    const idSet = new Set(ids.map(String));
    scenes = scenes.filter((m) => !idSet.has(m.id));
    emit();
  };

  // --- Test Data Operations ---
  const addTestData = (sceneId: string, data: Partial<SceneTestData>) => {
    scenes = scenes.map(scene => {
      if (scene.id === sceneId) {
        const currentList = scene.testDataList || [];
        const newId = getNextId(currentList);
        const newItem: SceneTestData = {
          id: newId,
          mark: data.mark || '',
          status: 'active',
          isDefault: data.isDefault || false,
          type: data.type || 'reusable',
          autoExecute: data.autoExecute || false,
          environmentIds: data.environmentIds || [],
          content: data.content || '',
          createTime: nowText(),
          updatedTime: nowText(),
          updatedBy: '管理员'
        };
        return { 
          ...scene, 
          testDataList: [newItem, ...currentList],
          testDataCount: currentList.length + 1
        };
      }
      return scene;
    });
    emit();
  };

  const updateTestData = (sceneId: string, dataId: string, data: Partial<SceneTestData>) => {
    scenes = scenes.map(scene => {
      if (scene.id === sceneId && scene.testDataList) {
        const newList = scene.testDataList.map(item => 
          item.id === dataId ? { ...item, ...data, updatedTime: nowText() } : item
        );
        return { ...scene, testDataList: newList };
      }
      return scene;
    });
    emit();
  };

  const removeTestData = (sceneId: string, dataIds: string[]) => {
    scenes = scenes.map(scene => {
      if (scene.id === sceneId && scene.testDataList) {
        const newList = scene.testDataList.filter(item => !dataIds.includes(item.id));
        return { 
          ...scene, 
          testDataList: newList,
          testDataCount: newList.length
        };
      }
      return scene;
    });
    emit();
  };

  // --- Validation Rule Operations ---
  const addValidationRule = (sceneId: string, rule: Partial<ValidationRule>) => {
    scenes = scenes.map(scene => {
      if (scene.id === sceneId) {
        const currentList = scene.validationRules || [];
        const newId = getNextId(currentList);
        const newItem: ValidationRule = {
          id: newId,
          name: rule.name || '0',
          type: rule.type || 'node',
          pathOrRule: rule.pathOrRule || '',
          expectedType: rule.expectedType || 'constant',
          expectedValue: rule.expectedValue || '',
          status: 'active',
          ...rule,
        };
        return { 
          ...scene, 
          validationRules: [newItem, ...currentList],
          validationRuleCount: currentList.length + 1
        };
      }
      return scene;
    });
    emit();
  };

  const updateValidationRule = (sceneId: string, ruleId: string, rule: Partial<ValidationRule>) => {
    scenes = scenes.map(scene => {
      if (scene.id === sceneId && scene.validationRules) {
        const newList = scene.validationRules.map(item => 
          item.id === ruleId ? { ...item, ...rule } : item
        );
        return { ...scene, validationRules: newList };
      }
      return scene;
    });
    emit();
  };

  const removeValidationRule = (sceneId: string, ruleIds: string[]) => {
    scenes = scenes.map(scene => {
      if (scene.id === sceneId && scene.validationRules) {
        const newList = scene.validationRules.filter(item => !ruleIds.includes(item.id));
        return { 
          ...scene, 
          validationRules: newList,
          validationRuleCount: newList.length
        };
      }
      return scene;
    });
    emit();
  };

  return {
    subscribe,
    getSnapshot,
    createScene,
    updateScene,
    removeScenes,
    addTestData,
    updateTestData,
    removeTestData,
    addValidationRule,
    updateValidationRule,
    removeValidationRule,
  };
})();

export default sceneStore;
