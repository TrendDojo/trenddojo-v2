"use client";

import { useEffect, useRef, useState } from 'react';

export function BasicChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('initializing');

  useEffect(() => {
    const initChart = async () => {
      try {
        setStatus('importing library');

        // Dynamic import with namespace
        const LightweightCharts = await import('lightweight-charts');

        setStatus('library imported');
    // DEBUG: console.log('LightweightCharts imported:', Object.keys(LightweightCharts));

        if (!containerRef.current) {
          setStatus('no container');
          return;
        }

        setStatus('creating chart');

        // Use the namespace import
        const chart = LightweightCharts.createChart(containerRef.current, {
          width: 600,
          height: 300,
          layout: {
            background: { type: LightweightCharts.ColorType.Solid, color: 'white' },
            textColor: 'black',
          },
        });

        setStatus('chart created');
    // DEBUG: console.log('Chart object:', chart);
    // DEBUG: console.log('Chart methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(chart)));

        let lineSeries: any;

        // Try to find the addLineSeries method
        if (typeof (chart as any).addLineSeries === 'function') {
          // Add a simple line series
          lineSeries = (chart as any).addLineSeries({
            color: 'blue',
            lineWidth: 2,
          });
        } else {
          // Log what methods are actually available
    // DEBUG: console.log('addLineSeries not found. Available methods:', Object.keys(chart));

          // Try accessing it differently
          const chartApi = chart as any;
          if (chartApi._private && chartApi._private._chartWidget) {
            setStatus('found private chart widget');
    // DEBUG: console.log('Private widget:', chartApi._private._chartWidget);
          }

          // Try the chart API directly
          if ((chart as any).addLineSeries) {
            setStatus('found addLineSeries on cast');
            lineSeries = (chart as any).addLineSeries({
              color: 'blue',
              lineWidth: 2,
            });
          } else {
            setStatus('addLineSeries method not available');
            return;
          }
        }

        setStatus('series added');

        // Add simple data
        if (lineSeries) {
          lineSeries.setData([
            { time: '2024-01-01', value: 100 },
            { time: '2024-01-02', value: 110 },
            { time: '2024-01-03', value: 105 },
            { time: '2024-01-04', value: 120 },
            { time: '2024-01-05', value: 115 },
          ]);

          setStatus('data set - chart ready');
        }

      } catch (error) {
        console.error('Chart initialization error:', error);
        setStatus(`error: ${error}`);
      }
    };

    initChart();
  }, []);

  return (
    <div>
      <p className="text-sm mb-2">Status: {status}</p>
      <div ref={containerRef} style={{ border: '1px solid #ccc' }} />
    </div>
  );
}