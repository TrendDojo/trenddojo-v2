"use client";

import dynamic from 'next/dynamic';

const DynamicChart = dynamic(
  () => import('./ChartContent'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
          <p className="text-sm dark:text-gray-400 text-gray-600">Loading chart library...</p>
        </div>
      </div>
    )
  }
);

export function ChartWrapper({ symbol }: { symbol: string }) {
  return <DynamicChart symbol={symbol} />;
}