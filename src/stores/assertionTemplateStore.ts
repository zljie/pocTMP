import { useSyncExternalStore } from 'react';

export interface AssertionRule {
  checkPoint: string; // statusCode, responseTime, jsonField, dbField
  operator: string;   // eq, contains, gt, lt, neq...
  value: string;
  key?: string;       // For jsonField/dbField (e.g., data.id)
}

export type TemplateCategory = 'built-in' | 'project' | 'personal';

export interface AssertionTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  rules: AssertionRule[];
}

const initialTemplates: AssertionTemplate[] = [
  // Built-in
  {
    id: 'b1',
    name: '标准成功响应',
    description: '状态码200且success为true',
    category: 'built-in',
    rules: [
      { checkPoint: 'statusCode', operator: 'eq', value: '200' },
      { checkPoint: 'jsonField', key: 'success', operator: 'eq', value: 'true' },
    ]
  },
  {
    id: 'b2',
    name: '性能达标检测',
    description: '响应时间小于500ms',
    category: 'built-in',
    rules: [
      { checkPoint: 'responseTime', operator: 'lt', value: '500' },
    ]
  },
  // Project
  {
    id: 'p1',
    name: '统一鉴权失败',
    description: '检查401状态及错误码',
    category: 'project',
    rules: [
      { checkPoint: 'statusCode', operator: 'eq', value: '401' },
      { checkPoint: 'jsonField', key: 'code', operator: 'eq', value: 'AUTH_FAIL' },
    ]
  },
  // Personal
  {
    id: 'u1',
    name: '我的常用断言',
    description: '检查特定字段存在性',
    category: 'personal',
    rules: [
      { checkPoint: 'statusCode', operator: 'eq', value: '200' },
      { checkPoint: 'jsonField', key: 'data.id', operator: 'notEmpty', value: '' },
    ]
  }
];

class AssertionTemplateStore {
  private templates: AssertionTemplate[] = initialTemplates;
  private listeners: Set<() => void> = new Set();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => {
    return this.templates;
  };

  addTemplate = (template: Omit<AssertionTemplate, 'id'>) => {
    const newTemplate = { ...template, id: Math.random().toString(36).substr(2, 9) };
    this.templates = [...this.templates, newTemplate];
    this.emit();
  };

  deleteTemplate = (id: string) => {
    this.templates = this.templates.filter(t => t.id !== id);
    this.emit();
  };

  private emit() {
    this.listeners.forEach(listener => listener());
  }
}

const assertionTemplateStore = new AssertionTemplateStore();
export default assertionTemplateStore;
