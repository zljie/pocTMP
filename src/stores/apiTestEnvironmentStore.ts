'use client';

import dayjs from 'dayjs';

export type ApiTestEnvironmentStatus = 'active' | 'inactive';

export interface ApiTestEnvironment {
  id: string;
  projectId: string;
  projectName: string;
  systemId: string;
  systemName: string;
  ipAddress: string;
  businessPort: string;
  defaultPath: string;
  isProxy: boolean;
  protocols: string[];
  status: ApiTestEnvironmentStatus;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const getNextId = (items: ApiTestEnvironment[]) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

const initialData: ApiTestEnvironment[] = [
  {
    id: '1',
    projectId: 'p1',
    projectName: '示例项目A',
    systemId: 'SYS-001',
    systemName: '用户中心',
    ipAddress: '10.10.1.12',
    businessPort: '8080',
    defaultPath: '/api',
    isProxy: false,
    protocols: ['HTTP', 'HTTPS'],
    status: 'active',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '2',
    projectId: 'p2',
    projectName: '示例项目B',
    systemId: 'SYS-002',
    systemName: '订单系统',
    ipAddress: '10.10.2.8',
    businessPort: '9000',
    defaultPath: '/openapi',
    isProxy: true,
    protocols: ['HTTP'],
    status: 'inactive',
    createTime: '2025-08-19 14:12:03',
    updatedTime: '2025-08-20 10:05:22',
    updatedBy: '张三',
  },
];

type CreatePayload = Omit<ApiTestEnvironment, 'id' | 'createTime' | 'updatedTime' | 'updatedBy'> & {
  updatedBy?: string;
};

type UpdatePayload = Partial<Omit<ApiTestEnvironment, 'id' | 'createTime'>> & {
  updatedBy?: string;
};

const apiTestEnvironmentStore = (() => {
  let items: ApiTestEnvironment[] = initialData;
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getSnapshot = () => items;

  const getById = (id: string) => items.find((item) => item.id === id);

  const create = (payload: CreatePayload) => {
    const updatedTime = nowText();
    const id = getNextId(items);
    const record: ApiTestEnvironment = {
      id,
      ...payload,
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
    let updatedRecord: ApiTestEnvironment | undefined;

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

  const removeMany = (ids: Array<string | number>) => {
    if (!ids.length) return;
    const idSet = new Set(ids.map(String));
    items = items.filter((item) => !idSet.has(item.id));
    emit();
  };

  const removeOne = (id: string) => {
    removeMany([id]);
  };

  return {
    subscribe,
    getSnapshot,
    getById,
    create,
    update,
    removeMany,
    removeOne,
  };
})();

export default apiTestEnvironmentStore;

