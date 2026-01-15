'use client';

import dayjs from 'dayjs';

export type DictStatus = 'active' | 'inactive';
export type DictStyle = 'default' | 'primary' | 'success' | 'warning' | 'danger';

export interface DictTypeItem {
  id: string;
  name: string;
  type: string;
  status: DictStatus;
  remark?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

export interface DictDataItem {
  id: string;
  dictType: string;
  label: string;
  value: string;
  cssClass?: string;
  sort: number;
  listClass: DictStyle;
  remark?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

const nowText = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const getNextId = (items: Array<{ id: string }>) => {
  const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return String(maxId + 1);
};

const initialDictTypes: DictTypeItem[] = [
  {
    id: '1',
    name: '用户性别',
    type: 'sys_user_sex',
    status: 'active',
    remark: '用户性别列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '2',
    name: '菜单状态',
    type: 'sys_show_hide',
    status: 'active',
    remark: '菜单状态列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '3',
    name: '系统开关',
    type: 'sys_yes_no',
    status: 'active',
    remark: '系统开关列表',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

const initialDictData: DictDataItem[] = [
  {
    id: '1',
    dictType: 'sys_user_sex',
    label: '男',
    value: '0',
    sort: 1,
    listClass: 'primary',
    remark: '性别男',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '2',
    dictType: 'sys_user_sex',
    label: '女',
    value: '1',
    sort: 2,
    listClass: 'primary',
    remark: '性别女',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
  {
    id: '3',
    dictType: 'sys_user_sex',
    label: '未知',
    value: '2',
    sort: 3,
    listClass: 'default',
    remark: '性别未知',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

type DictSnapshot = {
  dictTypes: DictTypeItem[];
  dictData: DictDataItem[];
};

type CreateDictTypePayload = Omit<DictTypeItem, 'id' | 'createTime' | 'updatedTime' | 'updatedBy'> & {
  updatedBy?: string;
};

type UpdateDictTypePayload = Partial<Omit<DictTypeItem, 'id' | 'createTime'>> & { updatedBy?: string };

type CreateDictDataPayload = Omit<DictDataItem, 'id' | 'createTime' | 'updatedTime' | 'updatedBy'> & {
  updatedBy?: string;
};

type UpdateDictDataPayload = Partial<Omit<DictDataItem, 'id' | 'createTime'>> & { updatedBy?: string };

const dictStore = (() => {
  let dictTypes: DictTypeItem[] = initialDictTypes;
  let dictData: DictDataItem[] = initialDictData;
  let snapshot: DictSnapshot = { dictTypes, dictData };
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getSnapshot = (): DictSnapshot => {
    if (snapshot.dictTypes !== dictTypes || snapshot.dictData !== dictData) {
      snapshot = { dictTypes, dictData };
    }
    return snapshot;
  };

  const getTypeById = (id: string) => dictTypes.find((t) => t.id === id);

  const createType = (payload: CreateDictTypePayload) => {
    const updatedTime = nowText();
    const id = getNextId(dictTypes);
    const record: DictTypeItem = {
      id,
      name: payload.name,
      type: payload.type,
      status: payload.status ?? 'active',
      remark: payload.remark,
      createTime: updatedTime,
      updatedTime,
      updatedBy: payload.updatedBy ?? '管理员',
    };
    dictTypes = [record, ...dictTypes];
    emit();
    return record;
  };

  const updateType = (id: string, payload: UpdateDictTypePayload) => {
    const oldRecord = dictTypes.find((t) => t.id === id);
    if (!oldRecord) return undefined;

    const updatedTime = nowText();
    const updatedBy = payload.updatedBy ?? '管理员';
    const nextTypeValue = payload.type ?? oldRecord.type;

    let updatedRecord: DictTypeItem | undefined;
    dictTypes = dictTypes.map((item) => {
      if (item.id !== id) return item;
      updatedRecord = {
        ...item,
        ...payload,
        updatedTime,
        updatedBy,
      };
      return updatedRecord;
    });

    if (nextTypeValue !== oldRecord.type) {
      dictData = dictData.map((item) => (item.dictType === oldRecord.type ? { ...item, dictType: nextTypeValue } : item));
    }

    emit();
    return updatedRecord;
  };

  const removeTypes = (ids: Array<string | number>) => {
    if (!ids.length) return;
    const idSet = new Set(ids.map(String));
    const typeValuesToRemove = new Set(dictTypes.filter((t) => idSet.has(t.id)).map((t) => t.type));
    dictTypes = dictTypes.filter((t) => !idSet.has(t.id));
    if (typeValuesToRemove.size) {
      dictData = dictData.filter((d) => !typeValuesToRemove.has(d.dictType));
    }
    emit();
  };

  const createData = (payload: CreateDictDataPayload) => {
    const updatedTime = nowText();
    const id = getNextId(dictData);
    const record: DictDataItem = {
      id,
      dictType: payload.dictType,
      label: payload.label,
      value: payload.value,
      cssClass: payload.cssClass,
      sort: payload.sort ?? 0,
      listClass: payload.listClass ?? 'default',
      remark: payload.remark,
      createTime: updatedTime,
      updatedTime,
      updatedBy: payload.updatedBy ?? '管理员',
    };
    dictData = [record, ...dictData];
    emit();
    return record;
  };

  const updateData = (id: string, payload: UpdateDictDataPayload) => {
    const updatedTime = nowText();
    const updatedBy = payload.updatedBy ?? '管理员';
    let updatedRecord: DictDataItem | undefined;

    dictData = dictData.map((item) => {
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

  const removeData = (ids: Array<string | number>) => {
    if (!ids.length) return;
    const idSet = new Set(ids.map(String));
    dictData = dictData.filter((d) => !idSet.has(d.id));
    emit();
  };

  return {
    subscribe,
    getSnapshot,
    getTypeById,
    createType,
    updateType,
    removeTypes,
    createData,
    updateData,
    removeData,
  };
})();

export default dictStore;
