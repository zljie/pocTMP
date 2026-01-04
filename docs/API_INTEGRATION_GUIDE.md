---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022100b1fc07a7d0ff2bd45b3e9c55eda6fb45c5f77358d3a6239f89eac6273bbbb197022078241e34bdca6bb82f7040cb2775b48fa9153213d822a292b5f74292bcafea47
    ReservedCode2: 3045022100f1eaadd8ba30591003b884ca86a11f2958d949234f28abb7eb587d930ce1273d022022ce0f9569fc4530756032d8b4af55255ec8d36376c1d736b1cc1100e539888c
---

# 后端API对接指南

本文档说明如何将前端Mock数据切换为真实后端API。

## 一、API接口规范

### 1. 测试用例管理 API

#### 获取用例列表
```
GET /api/test-cases
Query参数:
  - page: 页码 (默认1)
  - pageSize: 每页数量 (默认10)
  - keyword: 搜索关键词
  - module: 模块筛选
  - status: 状态筛选

响应格式:
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 新增用例
```
POST /api/test-cases
Body:
{
  "description": "用例描述",
  "module": "模块名称",
  "requirement": "需求类型",
  "executionMethod": "自动|手动|混合",
  "project": "项目名称",
  "environment": "测试环境"
}
```

#### 更新/删除用例
```
PUT /api/test-cases/:id
DELETE /api/test-cases/:id
```

### 2. 测试需求管理 API

同上模式，接口路径为 `/api/test-requirements`

### 3. 测试计划管理 API

同上模式，接口路径为 `/api/test-plans`

---

## 二、切换步骤

### 步骤1: 创建API服务层

在 `src/lib/api.ts` 创建统一的API请求封装：

```typescript
// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// 测试用例API
export const testCaseApi = {
  getList: (params: Record<string, any>) =>
    request(`/api/test-cases?${new URLSearchParams(params)}`),
  create: (data: any) =>
    request('/api/test-cases', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    request(`/api/test-cases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request(`/api/test-cases/${id}`, { method: 'DELETE' }),
};
```

### 步骤2: 创建自定义Hooks

```typescript
// src/hooks/useTestCases.ts
import { useState, useEffect, useCallback } from 'react';
import { testCaseApi } from '@/lib/api';
import { TestCase } from '@/types';

export function useTestCases() {
  const [data, setData] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const result = await testCaseApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params,
      });
      setData(result.data.list);
      setPagination(prev => ({ ...prev, total: result.data.total }));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  return { data, loading, error, pagination, fetchData, setPagination };
}
```

### 步骤3: 修改页面组件

将页面中的Mock数据替换为Hooks调用：

```typescript
// 修改前 (Mock数据)
const [data, setData] = useState<TestCase[]>(mockTestCases);

// 修改后 (API数据)
const { data, loading, error, fetchData } = useTestCases();

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 步骤4: 配置环境变量

创建 `.env.local` 文件：

```
NEXT_PUBLIC_API_URL=https://your-api-server.com
```

---

## 三、错误处理规范

### 统一错误处理

```typescript
// src/lib/errorHandler.ts
import { message } from 'antd';

export function handleApiError(error: any) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        message.error('登录已过期，请重新登录');
        // 跳转登录页
        break;
      case 403:
        message.error('没有权限执行此操作');
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 500:
        message.error('服务器错误，请稍后重试');
        break;
      default:
        message.error('操作失败');
    }
  } else {
    message.error('网络错误，请检查网络连接');
  }
}
```

### 页面级错误边界

```typescript
// src/components/ErrorBoundary.tsx
'use client';
import React from 'react';
import { Result, Button } from 'antd';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="页面出错了"
          subTitle="请刷新页面重试"
          extra={<Button onClick={() => window.location.reload()}>刷新页面</Button>}
        />
      );
    }
    return this.props.children;
  }
}
```

---

## 四、状态管理升级方案

当应用复杂度增加时，建议采用以下方案：

### 方案A: React Context + useReducer

适用于中等复杂度应用，无需额外依赖。

```typescript
// src/context/AppContext.tsx
const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
```

### 方案B: Zustand

轻量级状态管理，推荐用于中大型应用。

```bash
pnpm add zustand
```

```typescript
// src/store/testCaseStore.ts
import { create } from 'zustand';

interface TestCaseStore {
  cases: TestCase[];
  loading: boolean;
  fetchCases: () => Promise<void>;
  addCase: (data: TestCase) => void;
}

export const useTestCaseStore = create<TestCaseStore>((set) => ({
  cases: [],
  loading: false,
  fetchCases: async () => {
    set({ loading: true });
    const result = await testCaseApi.getList({});
    set({ cases: result.data.list, loading: false });
  },
  addCase: (data) => set((state) => ({ cases: [...state.cases, data] })),
}));
```

---

## 五、数据库表设计参考

### test_cases 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| description | VARCHAR(500) | 用例描述 |
| module | VARCHAR(100) | 所属模块 |
| requirement | VARCHAR(50) | 需求类型 |
| execution_method | ENUM | 执行方式 |
| step_count | INT | 步骤数量 |
| project_id | INT | 项目ID |
| status | ENUM | 数据状态 |
| environment | VARCHAR(50) | 测试环境 |
| created_by | INT | 创建人ID |
| created_at | DATETIME | 创建时间 |
| updated_by | INT | 修改人ID |
| updated_at | DATETIME | 修改时间 |

### test_requirements 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(200) | 需求名称 |
| type | ENUM | 需求类型 |
| priority | ENUM | 优先级 |
| status | ENUM | 状态 |
| project_id | INT | 项目ID |
| description | TEXT | 需求描述 |
| created_by | INT | 创建人ID |
| created_at | DATETIME | 创建时间 |

### test_plans 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(200) | 计划名称 |
| version | VARCHAR(20) | 版本号 |
| status | ENUM | 状态 |
| progress | INT | 进度(0-100) |
| case_count | INT | 用例数量 |
| start_date | DATE | 开始日期 |
| end_date | DATE | 结束日期 |
| owner_id | INT | 负责人ID |
| project_id | INT | 项目ID |
| created_at | DATETIME | 创建时间 |

---

## 六、后端技术栈建议

1. **Node.js + Express/Koa** - 轻量快速
2. **NestJS** - 企业级架构
3. **Java Spring Boot** - 企业级首选
4. **Python FastAPI** - 高性能API

推荐使用 **NestJS** 或 **Spring Boot**，便于与前端TypeScript生态配合。
