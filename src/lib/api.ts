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

    return response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
}

// 测试用例API
export const testCaseApi = {
  getList: (params: Record<string, string | number>) =>
    request<ListResponse<any>>(`/api/test-cases?${new URLSearchParams(params as Record<string, string>)}`),
  
  getById: (id: number) =>
    request<any>(`/api/test-cases/${id}`),
  
  create: (data: any) =>
    request<any>('/api/test-cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    request<any>(`/api/test-cases/${id}`, {
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
    request<ListResponse<any>>(`/api/test-requirements?${new URLSearchParams(params as Record<string, string>)}`),
  
  create: (data: any) =>
    request<any>('/api/test-requirements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    request<any>(`/api/test-requirements/${id}`, {
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
    request<ListResponse<any>>(`/api/test-plans?${new URLSearchParams(params as Record<string, string>)}`),
  
  create: (data: any) =>
    request<any>('/api/test-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: number, data: any) =>
    request<any>(`/api/test-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: number) =>
    request<void>(`/api/test-plans/${id}`, {
      method: 'DELETE',
    }),
  
  updateStatus: (id: number, status: string) =>
    request<any>(`/api/test-plans/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};
