'use client';

import dayjs from 'dayjs';

export type CombinationSceneStatus = 'active' | 'inactive';
export type SuccessCondition = 'all_pass' | 'single_stats'; // 全部场景测试通过 | 单独统计各场景测试结果
export type ExecutionMode = 'independent' | 'shared'; // 使用独立客户端 | 使用共享客户端

// --- Configuration Types ---

export interface ReplaceVariable {
  id: string;
  variableName: string; // 要替换的参数名称
  sourceType: 'template' | 'global' | 'constant' | 'context'; // 使用模版变量、全局变量、常量、上下文变量
  sourceValue: string; // 变量值/名称
  targetType: 'input' | 'header' | 'query'; // 入参节点、请求头、查询参数
}

export interface SaveVariable {
  id: string;
  variableName: string; // 要保存的变量名
  sourceType: 'input' | 'output' | 'response_header'; // 入参、出参、响应头
  sourcePath: string; // 节点路径
}

export interface SceneConfig {
  environmentId?: string; // 测试环境
  replaceVariables: ReplaceVariable[];
  saveVariables: SaveVariable[];
  retryCount: number;
  testInterval: number; // ms
  failureHandling: 'stop' | 'continue' | 'continue_final'; // 结束测试 | 执行下一个场景 | 执行最后一个场景
  isAsync: boolean;
}

export interface IncludedScene {
  id: string; // Relationship ID
  sceneId: string;
  sceneName: string;
  interfaceName: string;
  messageName: string;
  testDataCount: number;
  validationRuleCount: number;
  requestPath: string;
  projectId: string; // From scene
  remark?: string;
  createTime: string;
  executeOrder: number;
  config: SceneConfig;
}

export interface CombinationSceneType {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  successCondition: SuccessCondition;
  executionMode: ExecutionMode;
  status: CombinationSceneStatus;
  remark?: string;
  includedScenes: IncludedScene[];
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const getNextId = (items: Array<{ id: string }>) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

const defaultConfig: SceneConfig = {
  replaceVariables: [],
  saveVariables: [],
  retryCount: 0,
  testInterval: 1000,
  failureHandling: 'stop',
  isAsync: false,
};

// Mock Referenced IDs (simulating test set references)
const REFERENCED_IDS = ['5', '10'];

// Initial Mock Data
const initialData: CombinationSceneType[] = [
  {
    id: '5',
    name: '8503环境组合场景',
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    successCondition: 'single_stats',
    executionMode: 'independent',
    status: 'active',
    remark: '部分场景配置了其他用工的测试环境',
    includedScenes: Array(15).fill(null).map((_, i) => ({
      id: `inc_${i}`,
      sceneId: `36`,
      sceneName: 'NQueryYigoFlatUDataByKey01',
      interfaceName: '通过用户id获取用户权限数据',
      messageName: 'NQueryYigoFlatUDataByKey01',
      testDataCount: 2,
      validationRuleCount: 3,
      requestPath: '/FlatDataService/queryYigoFlatUDataByKey',
      projectId: 'p1',
      createTime: '2022-08-31 00:14:53',
      executeOrder: i + 1,
      config: { ...defaultConfig },
    })),
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '6',
    name: '80环境组合场景',
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    successCondition: 'single_stats',
    executionMode: 'independent',
    status: 'active',
    includedScenes: Array(9).fill(null).map((_, i) => ({
      id: `inc_6_${i}`,
      sceneId: `37`,
      sceneName: 'NQueryYigoFlatUDataByKey02',
      interfaceName: '通过用户id获取用户权限数据',
      messageName: 'NQueryYigoFlatUDataByKey01',
      testDataCount: 1,
      validationRuleCount: 2,
      requestPath: '/FlatDataService/queryYigoFlatUDataByKey',
      projectId: 'p1',
      createTime: '2022-08-31 00:14:53',
      executeOrder: i + 1,
      config: { ...defaultConfig },
    })),
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '10',
    name: '其他用工权限登录 (82端口测试)',
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    successCondition: 'single_stats',
    executionMode: 'independent',
    status: 'active',
    includedScenes: [],
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '14',
    name: '测试权限01',
    projectId: 'p2',
    projectName: '示例项目B',
    successCondition: 'all_pass',
    executionMode: 'shared',
    status: 'active',
    remark: '1111',
    includedScenes: [
      {
         id: 'inc_14_1',
         sceneId: '38',
         sceneName: 'NQueryYigoFlatUDataByKey03',
         interfaceName: '通过用户id获取用户权限数据',
         messageName: 'NQueryYigoFlatUDataByKey03',
         testDataCount: 1,
         validationRuleCount: 2,
         requestPath: '/FlatDataService/queryYigoFlatUDataByKey',
         projectId: 'p1',
         createTime: '2025-08-18 09:57:50',
         executeOrder: 1,
         config: { ...defaultConfig },
      }
    ],
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

type CreatePayload = Omit<CombinationSceneType, 'id' | 'createTime' | 'updatedTime' | 'updatedBy' | 'includedScenes'> & {
  updatedBy?: string;
};

type UpdatePayload = Partial<Omit<CombinationSceneType, 'id' | 'createTime' | 'includedScenes'>> & {
  updatedBy?: string;
};

const combinationSceneStore = (() => {
  let items: CombinationSceneType[] = initialData;
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getSnapshot = () => items;

  const create = (payload: CreatePayload) => {
    const updatedTime = nowText();
    const id = getNextId(items);
    const record: CombinationSceneType = {
      id,
      ...payload,
      includedScenes: [], // New combinations start with no scenes
      createTime: updatedTime,
      updatedTime,
      updatedBy: payload.updatedBy ?? '管理员',
    };
    items = [record, ...items];
    emit();
    return record;
  };

  const update = (id: string, payload: UpdatePayload) => {
    const updatedTime = nowText();
    const updatedBy = payload.updatedBy ?? '管理员';
    let updatedRecord: CombinationSceneType | undefined;

    items = items.map((item) => {
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

  const remove = (id: string) => {
    if (REFERENCED_IDS.includes(id)) {
      throw new Error(`ID=${id} 组合场景被测试集引用，不可被删除`);
    }
    items = items.filter((item) => item.id !== id);
    emit();
  };

  const removeBatch = (ids: Array<string | number>) => {
    const strIds = ids.map(String);
    const referenced = strIds.filter(id => REFERENCED_IDS.includes(id));
    const toDelete = strIds.filter(id => !REFERENCED_IDS.includes(id));

    if (toDelete.length > 0) {
      const deleteSet = new Set(toDelete);
      items = items.filter((item) => !deleteSet.has(item.id));
      emit();
    }

    return {
      successIds: toDelete,
      failedIds: referenced,
    };
  };

  const copy = (id: string) => {
    const original = items.find((item) => item.id === id);
    if (!original) {
      throw new Error('场景不存在');
    }

    const newId = getNextId(items);
    const updatedTime = nowText();

    const newIncludedScenes = original.includedScenes.map(s => ({
      ...s,
      id: `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }));

    const newRecord: CombinationSceneType = {
      ...original,
      id: newId,
      name: `${original.name}-副本`,
      createTime: updatedTime,
      updatedTime: updatedTime,
      updatedBy: '管理员',
      includedScenes: newIncludedScenes,
    };

    items = [newRecord, ...items];
    emit();
    return newRecord;
  };

  const removeMany = (ids: Array<string | number>) => {
     // Legacy wrapper if needed, but we'll use removeBatch
     return removeBatch(ids);
  };

  // --- Included Scene Operations ---
  const addIncludedScenes = (combinationId: string, scenes: Omit<IncludedScene, 'id' | 'executeOrder' | 'config'>[]) => {
    items = items.map(item => {
      if (item.id === combinationId) {
        const currentScenes = item.includedScenes || [];
        // Max 15 check
        if (currentScenes.length + scenes.length > 15) {
          throw new Error('每个场景添加上限 15 个');
        }

        let maxOrder = currentScenes.length > 0 
          ? Math.max(...currentScenes.map(s => s.executeOrder))
          : 0;
        
        const newScenes: IncludedScene[] = scenes.map(s => {
          maxOrder += 1;
          return {
            id: `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...s,
            executeOrder: maxOrder,
            config: { ...defaultConfig },
          };
        });

        return {
          ...item,
          includedScenes: [...currentScenes, ...newScenes],
          updatedTime: nowText(),
        };
      }
      return item;
    });
    emit();
  };

  const removeIncludedScene = (combinationId: string, includedSceneIds: string[]) => {
    items = items.map(item => {
      if (item.id === combinationId) {
        const remainingScenes = item.includedScenes
          .filter(s => !includedSceneIds.includes(s.id))
          // Re-calculate orders to keep them sequential? Usually good practice but might disrupt user intent if they manually ordered.
          // For now let's just keep their original relative orders or re-normalize?
          // Requirement says "Execute Order" can be sorted. Let's re-normalize to 1..N
          .sort((a, b) => a.executeOrder - b.executeOrder)
          .map((s, idx) => ({ ...s, executeOrder: idx + 1 }));

        return {
          ...item,
          includedScenes: remainingScenes,
          updatedTime: nowText(),
        };
      }
      return item;
    });
    emit();
  };

  const updateIncludedSceneConfig = (combinationId: string, includedSceneId: string, config: Partial<SceneConfig>) => {
    items = items.map(item => {
      if (item.id === combinationId) {
        return {
          ...item,
          includedScenes: item.includedScenes.map(s => 
            s.id === includedSceneId ? { ...s, config: { ...s.config, ...config } } : s
          ),
          updatedTime: nowText(),
        };
      }
      return item;
    });
    emit();
  };

  const reorderIncludedScenes = (combinationId: string, orderedIds: string[]) => {
    items = items.map(item => {
      if (item.id === combinationId) {
        const sceneMap = new Map(item.includedScenes.map(s => [s.id, s]));
        const newScenes = orderedIds
          .map((id, index) => {
            const scene = sceneMap.get(id);
            if (scene) {
              return { ...scene, executeOrder: index + 1 };
            }
            return null;
          })
          .filter((s): s is IncludedScene => s !== null);
          
        return {
          ...item,
          includedScenes: newScenes,
          updatedTime: nowText(),
        };
      }
      return item;
    });
    emit();
  };

  return {
    subscribe,
    getSnapshot,
    getServerSnapshot: getSnapshot,
    create,
    update,
    remove,
    removeBatch,
    removeMany,
    copy,
    addIncludedScenes,
    removeIncludedScene,
    updateIncludedSceneConfig,
    reorderIncludedScenes
  };
})();

export default combinationSceneStore;
