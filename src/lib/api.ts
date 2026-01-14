/**
 * API请求封装
 * 当后端API就绪后，修改 API_BASE_URL 即可切换到真实接口
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

interface ListResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // 认证token可在此添加
        // 'Authorization': `Bearer ${getToken()}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
}

const toSearchParams = (params: Record<string, string | number | boolean | null | undefined>) => {
  const entries: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    entries[key] = String(value);
  });
  return new URLSearchParams(entries);
};

// 测试用例API
export const testCaseApi = {
  getList: (params: Record<string, string | number>) =>
    request<ListResponse<unknown>>(`/api/test-cases?${toSearchParams(params)}`),
  
  getById: (id: number) =>
    request<unknown>(`/api/test-cases/${id}`),
  
  create: (data: unknown) =>
    request<unknown>('/api/test-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: unknown) =>
    request<unknown>(`/api/test-cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    request<void>(`/api/test-cases/${id}`, {
      method: 'DELETE',
    }),
  
  batchDelete: (ids: number[]) =>
    request<void>('/api/test-cases/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),
};

// 测试需求API
export const testRequirementApi = {
  getList: (params: Record<string, string | number>) =>
    request<ListResponse<unknown>>(`/api/test-requirements?${toSearchParams(params)}`),
  
  create: (data: unknown) =>
    request<unknown>('/api/test-requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: unknown) =>
    request<unknown>(`/api/test-requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    request<void>(`/api/test-requirements/${id}`, {
      method: 'DELETE',
    }),
};

// 测试计划API
export const testPlanApi = {
  getList: (params: Record<string, string | number>) =>
    request<ListResponse<unknown>>(`/api/test-plans?${toSearchParams(params)}`),
  
  create: (data: unknown) =>
    request<unknown>('/api/test-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: unknown) =>
    request<unknown>(`/api/test-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    request<void>(`/api/test-plans/${id}`, {
      method: 'DELETE',
    }),
  
  updateStatus: (id: number, status: string) =>
    request<unknown>(`/api/test-plans/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
