"use client";

import React, { useEffect, useRef, useState } from 'react';

export function SimpleChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setLog(prev => [...prev, msg]);
  };

  useEffect(() => {
    const createSimpleChart = async () => {
      try {
        addLog('Starting chart creation...');

        if (!chartRef.current) {
          addLog('ERROR: No chart ref');
          return;
        }

        // Test 1: Import the module
        const LW = await import('lightweight-charts');
        addLog(`Import successful. Keys: ${Object.keys(LW).join(', ')}`);

        // Test 2: Check if we have what we need
        if (!LW.createChart) {
          addLog('ERROR: No createChart function');
          return;
        }

        // Test 3: Create a basic chart
        const chart = LW.createChart(chartRef.current, {
          width: 600,
          height: 300,
        });
        addLog('Chart created successfully');

        // Test 4: Check what methods the chart has
        const chartMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(chart));
        addLog(`Chart methods: ${chartMethods.slice(0, 10).join(', ')}...`);

        // Test 5: Try the old API (v4 style)
        if (typeof (chart as any).addLineSeries === 'function') {
          addLog('Found addLineSeries (v4 API)');
          const series = (chart as any).addLineSeries({ color: '#2962FF' });
          series.setData([
            { time: '2024-01-01', value: 100 },
            { time: '2024-01-02', value: 110 },
            { time: '2024-01-03', value: 105 },
          ]);
          addLog('Data set using v4 API');
        }
        // Test 6: Try the new API (v5 style)
        else if (typeof chart.addSeries === 'function' && LW.LineSeries) {
          addLog('Found addSeries and LineSeries (v5 API)');
          const series = chart.addSeries(LW.LineSeries, { color: '#2962FF' });
          series.setData([
            { time: '2024-01-01', value: 100 },
            { time: '2024-01-02', value: 110 },
            { time: '2024-01-03', value: 105 },
          ]);
          addLog('Data set using v5 API');
        } else {
          addLog('ERROR: Could not find a way to add series');
          addLog(`Has addSeries: ${typeof chart.addSeries}`);
          addLog(`Has LineSeries: ${!!LW.LineSeries}`);
        }

        // Test 7: Try to fit content
        if (typeof (chart as any).timeScale === 'function') {
          (chart as any).timeScale().fitContent();
          addLog('Called fitContent');
        }

        addLog('SUCCESS: Chart should be visible');

      } catch (error) {
        addLog(`ERROR: ${error}`);
      }
    };

    createSimpleChart();
  }, []);

  return (
    <div style={{ padding: '20px', border: '2px solid blue', background: 'white' }}>
      <h3>Simple Chart Test</h3>
      <div ref={chartRef} style={{ width: '600px', height: '300px', border: '1px solid red', marginBottom: '20px' }} />
      <div style={{ fontSize: '12px', fontFamily: 'monospace', background: '#f0f0f0', padding: '10px', maxHeight: '200px', overflow: 'auto' }}>
        {log.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
}