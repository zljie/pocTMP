'use client';

import dayjs from 'dayjs';

export interface DataSource {
  id: string;
  projectId: string;
  projectName: string;
  dbType: string;
  connectionAddress: string;
  dbName: string;
  username: string;
  password?: string; // Optional for security display, but required in form
  remark: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const getNextId = (items: DataSource[]) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

const initialData: DataSource[] = [
  {
    id: '1',
    projectId: 'p1',
    projectName: '电商前台项目',
    dbType: 'mysql',
    connectionAddress: '127.0.0.1:3306',
    dbName: 'test',
    username: 'test',
    password: 'password123',
    remark: '',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '7',
    projectId: 'p2',
    projectName: '后台管理系统',
    dbType: 'mysql',
    connectionAddress: '192.168.1.100:3306',
    dbName: 'admin_db',
    username: 'admin',
    password: 'password456',
    remark: '生产备库',
    createTime: '2025-08-19 14:12:03',
    updatedTime: '2025-08-20 10:05:22',
    updatedBy: '张三',
  },
  {
    id: '8',
    projectId: 'p3',
    projectName: '支付网关服务',
    dbType: 'oracle',
    connectionAddress: '192.168.1.200:1521',
    dbName: 'pay_db',
    username: 'pay_user',
    password: 'password789',
    remark: '',
    createTime: '2025-08-21 11:30:00',
    updatedTime: '2025-08-21 11:30:00',
    updatedBy: '李四',
  },
];

type CreatePayload = Omit<DataSource, 'id' | 'createTime' | 'updatedTime' | 'updatedBy'> & {
  updatedBy?: string;
};

type UpdatePayload = Partial<Omit<DataSource, 'id' | 'createTime'>> & {
  updatedBy?: string;
};

const dataSourceStore = (() => {
  let items: DataSource[] = initialData;
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
    const record: DataSource = {
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
    let updatedRecord: DataSource | undefined;

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

export default dataSourceStore;
