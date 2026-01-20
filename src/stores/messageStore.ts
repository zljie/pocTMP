'use client';

import dayjs from 'dayjs';

export type MessageStatus = 'active' | 'inactive';
export type MessageTypeType = 'XML' | 'URL' | 'JSON';

export interface HeaderConfig {
  headers: any[];
  querys: any[];
  authorization: any[];
  method?: string;
  connectTimeOut?: string;
  readTimeOut?: string;
  recEncType?: string;
  encType?: string;
}

export interface MessageType {
  id: string;
  name: string;
  type: MessageTypeType;
  interfaceId: string;
  interfaceName: string;
  status: MessageStatus;
  sceneCount: number;
  projectId: string;
  projectName: string;
  headerConfig?: HeaderConfig;
  requestPath?: string;
  body?: string;
  createNormalScene: boolean;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
  // For relations
  nodeIds?: string[];
}

export interface InterfaceType {
  id: string;
  name: string; // 英文名
  name_cn: string; // 中文名
  path: string;
  type: string; // 接口类型
  protocol: string; // HTTP协议
  status: 'active' | 'inactive';
  remark?: string;
  projectName: string;
}

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const getNextId = (items: Array<{ id: string }>) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

// Mock Interfaces Data (based on screenshot 3)
export const initialInterfaces: InterfaceType[] = [
  {
    id: '9',
    name: 'NQueryYigoFlatUDataByKey',
    name_cn: '通过用户id获取用户权限数据',
    path: '/FlatDataService/queryYigoFlatUDataByKey',
    type: 'HTTP协议',
    protocol: 'HTTP',
    status: 'active',
    projectName: '基础资料平台(mdm)',
  },
  {
    id: '10',
    name: 'NQueryFlatMDataByEntryKey',
    name_cn: '通过菜单入口id获取菜单权限',
    path: '/FlatDataService/queryFlatMDataByEntryKey',
    type: 'HTTP协议',
    protocol: 'active',
    status: 'active',
    projectName: '基础资料平台(mdm)',
  },
  {
    id: '11',
    name: 'NLogin-IT001',
    name_cn: '登录',
    path: '/authsso/login',
    type: 'HTTP协议',
    protocol: 'HTTP',
    status: 'active',
    projectName: '基础资料平台(mdm)',
  },
  {
    id: '12',
    name: 'NdecryptionAuthInfo',
    name_cn: '用户身份认证',
    path: '/authsso/decryptionAuthInfo',
    type: 'HTTP协议',
    protocol: 'HTTP',
    status: 'active',
    projectName: '基础资料平台(mdm)',
  },
  {
    id: '13',
    name: 'NQueryFlatUDataByKey',
    name_cn: '通过用户id获取用户通用数据权限',
    path: '/FlatDataService/queryFlatUDataByKey',
    type: 'HTTP协议',
    protocol: 'HTTP',
    status: 'active',
    projectName: '基础资料平台(mdm)',
  }
];

// Mock Messages Data (based on screenshot 1)
const initialMessages: MessageType[] = [
  {
    id: '21',
    name: 'NQueryYigoFlatUDataByKey01',
    type: 'XML',
    interfaceId: '9',
    interfaceName: '通过用户id获取用户权限数据',
    status: 'active',
    sceneCount: 4,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    createNormalScene: true,
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '22',
    name: 'NQueryYigoFlatUDataByKey03',
    type: 'URL',
    interfaceId: '9',
    interfaceName: '通过用户id获取用户权限数据',
    status: 'active',
    sceneCount: 1,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    createNormalScene: true,
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '23',
    name: 'NQueryFlatMDataByEntryKey01',
    type: 'URL',
    interfaceId: '10',
    interfaceName: '通过菜单入口id获取菜单权限',
    status: 'active',
    sceneCount: 3,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    createNormalScene: true,
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '24',
    name: 'NLogin-IT001',
    type: 'URL',
    interfaceId: '11',
    interfaceName: '登录',
    status: 'active',
    sceneCount: 4,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    createNormalScene: true,
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '25',
    name: 'NQueryFlatMDataByEntryKey03',
    type: 'URL',
    interfaceId: '10',
    interfaceName: '通过菜单入口id获取菜单权限',
    status: 'active',
    sceneCount: 1,
    projectId: 'p1',
    projectName: '基础资料平台(mdm)',
    createNormalScene: true,
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

type MessageSnapshot = {
  messages: MessageType[];
  interfaces: InterfaceType[];
};

type CreateMessagePayload = Omit<MessageType, 'id' | 'createTime' | 'updatedTime' | 'updatedBy'> & {
  updatedBy?: string;
};

type UpdateMessagePayload = Partial<Omit<MessageType, 'id' | 'createTime'>> & { updatedBy?: string };

const messageStore = (() => {
  let messages: MessageType[] = initialMessages;
  let interfaces: InterfaceType[] = initialInterfaces;
  let snapshot: MessageSnapshot = { messages, interfaces };
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getSnapshot = (): MessageSnapshot => {
    if (snapshot.messages !== messages || snapshot.interfaces !== interfaces) {
      snapshot = { messages, interfaces };
    }
    return snapshot;
  };

  const createMessage = (payload: CreateMessagePayload) => {
    const updatedTime = nowText();
    const id = getNextId(messages);
    const record: MessageType = {
      id,
      ...payload,
      createTime: updatedTime,
      updatedTime,
      updatedBy: payload.updatedBy ?? '管理员',
    };
    messages = [record, ...messages];
    emit();
    return record;
  };

  const updateMessage = (id: string, payload: UpdateMessagePayload) => {
    const updatedTime = nowText();
    const updatedBy = payload.updatedBy ?? '管理员';
    let updatedRecord: MessageType | undefined;

    messages = messages.map((item) => {
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

  const removeMessages = (ids: Array<string | number>) => {
    if (!ids.length) return;
    const idSet = new Set(ids.map(String));
    messages = messages.filter((m) => !idSet.has(m.id));
    emit();
  };

  return {
    subscribe,
    getSnapshot,
    getServerSnapshot: getSnapshot,
    createMessage,
    updateMessage,
    removeMessages,
  };
})();

export default messageStore;
