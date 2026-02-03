'use client';

import React from 'react';
import { Card, List, Tag, Typography, Divider } from 'antd';
import type { AiResult } from '@/lib/ai/types';

const { Paragraph, Text } = Typography;

const severityColor = (severity: string) => {
  if (severity === 'critical') return 'red';
  if (severity === 'high') return 'volcano';
  if (severity === 'medium') return 'gold';
  return 'blue';
};

const priorityColor = (priority: string) => {
  if (priority === 'p0') return 'red';
  if (priority === 'p1') return 'volcano';
  if (priority === 'p2') return 'gold';
  return 'blue';
};

export const AiResultView: React.FC<{ result: AiResult }> = ({ result }) => {
  return (
    <Card bordered={false} styles={{ body: { padding: 16 } }}>
      <Paragraph style={{ marginBottom: 12 }}>{result.summary}</Paragraph>

      <Divider style={{ margin: '12px 0' }} />

      <Text strong>发现项</Text>
      <List
        size="small"
        dataSource={result.findings}
        locale={{ emptyText: '暂无' }}
        renderItem={(item) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag color={severityColor(item.severity)}>{item.severity}</Tag>
                <Text>{item.title}</Text>
              </div>
              {item.detail ? (
                <div style={{ marginTop: 6 }}>
                  <Text type="secondary">{item.detail}</Text>
                </div>
              ) : null}
              {item.evidence?.length ? (
                <div style={{ marginTop: 6 }}>
                  <Text type="secondary">证据：</Text>
                  <ul style={{ margin: '6px 0 0 18px' }}>
                    {item.evidence.map((e, idx) => (
                      <li key={idx}>
                        <Text type="secondary">{e}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </List.Item>
        )}
      />

      <Divider style={{ margin: '12px 0' }} />

      <Text strong>建议动作</Text>
      <List
        size="small"
        dataSource={result.actions}
        locale={{ emptyText: '暂无' }}
        renderItem={(item) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag color={priorityColor(item.priority)}>{item.priority}</Tag>
                <Text>{item.title}</Text>
              </div>
              {item.steps?.length ? (
                <ol style={{ margin: '6px 0 0 18px' }}>
                  {item.steps.map((s, idx) => (
                    <li key={idx}>
                      <Text type="secondary">{s}</Text>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </List.Item>
        )}
      />

      {result.artifacts?.markdown ? (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <Text strong>Markdown</Text>
          <pre style={{ marginTop: 8, padding: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
            {result.artifacts.markdown}
          </pre>
        </>
      ) : null}

      {result.artifacts?.bugDraft ? (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <Text strong>缺陷草稿</Text>
          <pre style={{ marginTop: 8, padding: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
            {result.artifacts.bugDraft}
          </pre>
        </>
      ) : null}
    </Card>
  );
};
