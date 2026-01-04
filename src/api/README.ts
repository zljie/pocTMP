// API 目录结构规划
// 本文件仅作为API设计文档，不实际运行

/*
API 路由规划:

1. 测试用例管理 API
   - GET    /api/test-cases       获取用例列表（支持分页、搜索、筛选）
   - POST   /api/test-cases       新增测试用例
   - GET    /api/test-cases/:id   获取单个用例详情
   - PUT    /api/test-cases/:id   更新测试用例
   - DELETE /api/test-cases/:id   删除测试用例
   - POST   /api/test-cases/batch-delete  批量删除
   - POST   /api/test-cases/import        导入用例
   - GET    /api/test-cases/export        导出用例

2. 测试需求管理 API
   - GET    /api/test-requirements       获取需求列表
   - POST   /api/test-requirements       新增测试需求
   - GET    /api/test-requirements/:id   获取需求详情
   - PUT    /api/test-requirements/:id   更新测试需求
   - DELETE /api/test-requirements/:id   删除测试需求

3. 测试计划管理 API
   - GET    /api/test-plans       获取计划列表
   - POST   /api/test-plans       新增测试计划
   - GET    /api/test-plans/:id   获取计划详情
   - PUT    /api/test-plans/:id   更新测试计划
   - DELETE /api/test-plans/:id   删除测试计划
   - PUT    /api/test-plans/:id/status  更新计划状态

4. 认证相关 API
   - POST   /api/auth/login       用户登录
   - POST   /api/auth/logout      用户登出
   - GET    /api/auth/profile     获取用户信息

数据库表设计建议:
- test_cases: 测试用例表
- test_requirements: 测试需求表
- test_plans: 测试计划表
- users: 用户表
- projects: 项目表
- modules: 模块表
*/

export const API_ENDPOINTS = {
  TEST_CASES: '/api/test-cases',
  TEST_REQUIREMENTS: '/api/test-requirements',
  TEST_PLANS: '/api/test-plans',
  AUTH: '/api/auth',
};
