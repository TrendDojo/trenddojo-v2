"use client";

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { BarChart3 } from 'lucide-react';
import { chartControlStyles } from '@/lib/chartStyles';

interface ChartControlsProps {
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  className?: string;
}

// Simple preset buttons - each combines range + optimal interval
const PRESETS = [
  {
    id: '1W',
    label: '1W',
    range: '1w',
    interval: '1h',
    intervalText: 'hourly',
    candles: 65  // 6.5 hours/day × 5 days (regular hours only)
  },
  {
    id: '1M',
    label: '1M',
    range: '1m',
    interval: '4h',
    intervalText: '4-hourly',
    candles: 66  // ~3 bars/day × 22 trading days
  },
  {
    id: '3M',
    label: '3M',
    range: '3m',
    interval: '1D',
    intervalText: 'daily',
    candles: 66  // ~66 trading days
  },
  {
    id: '1Y',
    label: '1Y',
    range: '1y',
    interval: '1W',
    intervalText: 'weekly',
    candles: 52  // 52 weeks
  },
  {
    id: 'ALL',
    label: 'ALL',
    range: 'all',
    interval: '1M',
    intervalText: 'monthly',
    candles: 60  // 5 years × 12 months
  }
];

export function ChartControls({
  selectedPreset,
  onPresetChange,
  className
}: ChartControlsProps) {
  const currentPreset = PRESETS.find(p => p.id === selectedPreset) || PRESETS[2]; // Default to 3M

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Single row of preset buttons */}
      <div className="flex items-center">
        {/* Buttons grouped tightly */}
        <div className="flex gap-0.5">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => onPresetChange(preset.id)}
              className={cn(
                chartControlStyles.presetButton.base,
                selectedPreset === preset.id
                  ? chartControlStyles.presetButton.active
                  : chartControlStyles.presetButton.inactive
              )}
              title={`${preset.intervalText} (~${preset.candles} candles)`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export preset data for use in chart component
export function getPresetConfig(presetId: string) {
  return PRESETS.find(p => p.id === presetId) || PRESETS[2];
}