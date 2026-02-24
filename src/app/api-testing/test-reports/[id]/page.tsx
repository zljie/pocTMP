'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { TestReportDetail } from '@/components/api-testing/TestReportDetail';

export default function ReportDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <MainLayout title="测试报告详情">
      <TestReportDetail reportId={id} />
    </MainLayout>
  );
}
