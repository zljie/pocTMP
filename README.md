# 自动化测试管理平台

基于 Next.js + React + TypeScript + Ant Design 构建的企业级自动化测试管理平台。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI 组件**: Ant Design 5.x
- **图表库**: ECharts
- **语言**: TypeScript
- **样式**: TailwindCSS + Ant Design 样式系统
- **状态管理**: React Hooks
- **包管理**: pnpm

## 功能模块

### 已实现的核心模块

1. **首页仪表板** (`/`)
   - 统计数据概览（用例数、需求数、执行数、通过率）
   - 测试执行趋势图（折线图）
   - 用例模块分布（环形图）
   - 需求状态分布（饼图）
   - 进行中的测试计划
   - 最近更新的测试用例

2. **测试用例管理** (`/test-cases`)
   - 用例列表展示（支持分页）
   - 搜索和筛选功能
   - 新增/编辑/删除用例
   - 批量删除功能
   - 导入/导出功能（界面已实现）

3. **测试需求管理** (`/test-requirements`)
   - 需求列表展示
   - 优先级和状态标签
   - CRUD 操作

4. **测试计划管理** (`/test-plans`)
   - 计划列表展示
   - 进度可视化
   - 状态管理
   - 日期范围选择

5. **系统管理** (`/system/*`)
   - 覆盖用户/角色/菜单/产品/岗位/参数/字典/环境/服务配置等系统配置能力
   - 页面数：14；功能点数：107（统计口径见“模块盘点”）

6. **租户管理** (`/tenant/*`)
   - 租户管理：查询、新增/修改、启停、删除/批量删除、导出、同步租户字典/参数（模拟）
   - 租户套餐：新增/修改/删除/导出、关联菜单树选择（展开/全选/父子联动）
   - 页面数：2；功能点数：24（统计口径见“模块盘点”）

7. **接口测试** (`/api-testing/*`)
   - 覆盖接口/报文/场景/组合场景/测试集/测试报告、数据源配置、变量模板等能力（含多弹窗配置与运行模拟）
   - 页面数：9；功能点数：158（统计口径见“模块盘点”）

### 模块盘点（页面/功能点统计）

统计口径：
- 页面数：按 Next.js App Router 路由页面文件统计（`src/app/**/page.tsx`）
- 功能点数：按“用户可操作能力”逐页归纳（查询/重置、列表、增删改、批量、导入导出、配置、运行等）

| 模块 | 路由前缀 | 页面数 | 功能点数 | 说明 |
| --- | --- | ---: | ---: | --- |
| 系统管理 | `/system` | 14 | 107 | 以系统配置类列表/详情/新增页为主 |
| 租户管理 | `/tenant` | 2 | 24 | 含租户管理与租户套餐 |
| 接口测试 | `/api-testing` | 9 | 158 | 含接口管理、场景/组合场景、测试集与测试报告等 |

### 待开发模块

- 测试执行管理
- Web自动化测试
- 性能测试
- 测试任务管理

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页仪表板（含图表）
│   ├── test-cases/        # 测试用例管理
│   ├── test-requirements/ # 测试需求管理
│   ├── test-plans/        # 测试计划管理
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # 可复用组件
│   └── layout/           # 布局组件
│       └── MainLayout.tsx # 主布局（侧边栏+头部）
├── lib/                   # 工具库
│   └── api.ts            # API请求封装（已预置）
├── mock/                  # Mock 数据
│   └── data.ts           # 模拟数据
├── types/                 # TypeScript 类型定义
│   └── index.ts          # 类型声明
└── api/                   # API 规划文档
    └── README.ts         # API 设计说明

docs/
└── API_INTEGRATION_GUIDE.md  # 后端对接指南
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000 查看应用。

### 生产构建

```bash
pnpm build
```

构建产物在 `out/` 目录。

## 后端对接

详细的后端对接说明请参考 [API对接指南](docs/API_INTEGRATION_GUIDE.md)，包含：

- API接口规范（RESTful设计）
- Mock数据切换到真实API的步骤
- 错误处理规范
- 状态管理升级方案
- 数据库表设计参考

### 快速切换到真实API

1. 配置环境变量 `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-server.com
   ```

2. 使用 `src/lib/api.ts` 中已封装好的API方法

3. 将页面中的 `mockData` 替换为API调用

## AI 能力（DeepSeek）

平台已内置 DeepSeek 的统一调用入口，供后续在不同模块复用。

### 环境变量

在运行环境中配置以下变量（建议仅在服务端环境变量中配置密钥，不要暴露到浏览器）：

```
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_API_URL=
```

### 调用方式

- 服务端路由：`POST /api/ai/deepseek/chat/`
  - 请求体：`{ messages, model?, temperature?, top_p?, max_tokens?, ... }`
  - 返回：`{ content, raw }`

- 前端调用（推荐复用封装方法）：

```ts
import { deepseekChat, toMessages } from '@/lib/deepseek';

const result = await deepseekChat({
  messages: toMessages('请用一句话总结本次测试报告'),
});

console.log(result.content);
```

## 响应式设计

- 桌面端: 完整侧边栏导航 + 多列布局
- 平板端: 可折叠侧边栏
- 移动端: 自适应单列布局

## 开发规范

1. 组件采用函数式组件 + Hooks
2. 使用 TypeScript 严格类型检查
3. 遵循 Ant Design 设计规范
4. 统一的代码风格和命名规范

## 部署说明

项目配置为静态导出模式，可部署到任何静态文件服务器。

```bash
# 构建静态文件
pnpm build

# 构建产物在 out/ 目录，可直接部署到Nginx/Apache/CDN等
```

## 许可证

MIT
