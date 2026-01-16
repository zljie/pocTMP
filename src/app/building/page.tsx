'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UnderConstruction from '@/components/common/UnderConstruction';

export default function BuildingPage() {
  return (
    <MainLayout title="开发中">
      <UnderConstruction />
    </MainLayout>
  );
}

