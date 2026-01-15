'use client';

import dayjs from 'dayjs';

export type ServiceConfigStatus = 'active' | 'inactive';

export interface ServiceConfig {
  id: string;
  addressName: string;
  address: string;
  cliServer: string;
  adminToken: string;
  scanUser: string;
  scanUserPassword: string;
  scanUserEmail: string;
  projectId: string;
  projectName: string;
  status: ServiceConfigStatus;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const getNextId = (items: ServiceConfig[]) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

const initialData: ServiceConfig[] = [
  {
    id: '1',
    addressName: '默认代码扫描服务',
    address: 'https://scanner.example.com',
    cliServer: 'https://cli.example.com',
    adminToken: 'token_example_******',
    scanUser: 'scanner_admin',
    scanUserPassword: '******',
    scanUserEmail: 'scanner_admin@example.com',
    projectId: 'p1',
    projectName: '示例项目A',
    status: 'active',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

type CreatePayload = Omit<ServiceConfig, 'id' | 'createTime' | 'updatedTime' | 'updatedBy'> & {
  updatedBy?: string;
};

type UpdatePayload = Partial<Omit<ServiceConfig, 'id' | 'createTime'>> & {
  updatedBy?: string;
};

const serviceConfigStore = (() => {
  let items: ServiceConfig[] = initialData;
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
    const record: ServiceConfig = {
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
    let updatedRecord: ServiceConfig | undefined;

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

export default serviceConfigStore;

