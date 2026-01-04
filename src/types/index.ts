// 测试用例类型
export interface TestCase {
  id: number;
  description: string;
  module: string;
  requirement: string;
  executionMethod: '自动' | '手动' | '混合';
  stepCount: number;
  project: string;
  status: '有效' | '无效' | '草稿';
  environment: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
}

// 测试需求类型
export interface TestRequirement {
  id: number;
  name: string;
  type: '功能' | '性能' | '接口' | '安全';
  priority: '高' | '中' | '低';
  status: '待评审' | '已通过' | '已驳回' | '已关闭';
  project: string;
  description: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

// 测试计划类型
export interface TestPlan {
  id: number;
  name: string;
  version: string;
  status: '未开始' | '进行中' | '已完成' | '已暂停';
  progress: number;
  caseCount: number;
  startDate: string;
  endDate: string;
  owner: string;
  project: string;
  createdAt: string;
}

// 分页类型
export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}
