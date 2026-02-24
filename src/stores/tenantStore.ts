import { create } from 'zustand';

export type TenantStatus = 'active' | 'inactive';

export interface TenantType {
  id: string;
  tenantCode: string;
  contactName: string;
  contactPhone: string;
  companyName: string;
  creditCode?: string;
  expireTime?: string;
  status: TenantStatus;
  packageId?: string;
  userCount?: number;
  bindDomain?: string;
  companyAddress?: string;
  companyCode?: string;
  companyIntro?: string;
  remark?: string;
  adminUserName?: string;
  createTime: string;
  updatedTime: string;
  updatedBy: string;
}

const initialTenants: TenantType[] = [
  {
    id: '1',
    tenantCode: '000000',
    contactName: '管理组',
    contactPhone: '15888888888',
    companyName: 'KLTech',
    creditCode: '',
    expireTime: '',
    status: 'active',
    packageId: 'pkg_2',
    userCount: 0,
    bindDomain: '',
    companyAddress: '',
    companyCode: '',
    companyIntro: '',
    remark: '',
    adminUserName: 'admin',
    createTime: '2025-08-18 09:57:50',
    updatedTime: '2025-08-18 09:57:50',
    updatedBy: '管理员',
  },
];

interface TenantState {
  tenants: TenantType[];
  currentTenant: TenantType | null;
  addTenant: (tenant: TenantType) => void;
  updateTenant: (id: string, updater: (prev: TenantType) => TenantType) => void;
  deleteTenants: (ids: string[]) => void;
  setTenants: (tenants: TenantType[]) => void;
  setCurrentTenant: (tenant: TenantType | null) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenants: initialTenants,
  currentTenant: initialTenants[0] || null,
  addTenant: (tenant) =>
    set((state) => ({ tenants: [tenant, ...state.tenants] })),
  updateTenant: (id, updater) =>
    set((state) => ({
      tenants: state.tenants.map((t) => (t.id === id ? updater(t) : t)),
      currentTenant:
        state.currentTenant?.id === id ? updater(state.currentTenant) : state.currentTenant,
    })),
  deleteTenants: (ids) =>
    set((state) => ({
      tenants: state.tenants.filter((t) => !ids.includes(t.id)),
      currentTenant:
        state.currentTenant && ids.includes(state.currentTenant.id) ? null : state.currentTenant,
    })),
  setTenants: (tenants) => set({ tenants }),
  setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
}));
