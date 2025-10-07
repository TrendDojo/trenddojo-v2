"use client";

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/Spinner';

const DynamicChart = dynamic(
  () => import('./ChartContent'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px]">
        <Spinner size="md" text="Loading chart library..." />
      </div>
    )
  }
);

export function ChartWrapper({ symbol }: { symbol: string }) {
  return <DynamicChart symbol={symbol} />;
}