"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContent } from '@/components/layout/PageContent';
import { BrokerDataRefreshIndicator } from '@/components/broker/BrokerDataRefreshIndicator';
import { Card } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { RefreshTrigger } from '@/hooks/useBrokerDataRefresh';

export default function TestRefreshPage() {
  const [lastData, setLastData] = useState<any>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<RefreshTrigger[]>(['mount']);
  const [intervalMs, setIntervalMs] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  };

  const handleDataUpdate = (data: any) => {
    setLastData(data);
    addLog(`Data updated: ${data.length} brokers`);
  };

  return (
    <AppLayout>
      <PageContent>
        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
            Broker Data Refresh Testing
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            Development tool for testing broker data refresh configurations and triggers
          </p>
        </div>

        {/* Test Configuration */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Configuration</h2>

          <div className="space-y-4">
            {/* Triggers Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                Refresh Triggers
              </label>
              <div className="flex flex-wrap gap-2">
                {(['mount', 'focus', 'interval', 'manual'] as RefreshTrigger[]).map(trigger => (
                  <label key={trigger} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={triggers.includes(trigger)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTriggers([...triggers, trigger]);
                        } else {
                          setTriggers(triggers.filter(t => t !== trigger));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm dark:text-gray-300">{trigger}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Interval Configuration */}
            {triggers.includes('interval') && (
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Interval (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  value={intervalMs / 1000}
                  onChange={(e) => setIntervalMs(Number(e.target.value) * 1000)}
                  className="w-32 px-3 py-2 rounded border dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Refresh Indicators with Different Configs */}
        <div className="space-y-6">
          {/* Default Configuration */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Default Configuration
            </h3>
            <BrokerDataRefreshIndicator
              refreshOptions={{
                triggers: ['mount'],
                onSuccess: () => addLog('Default: Success'),
                onError: (err) => addLog(`Default: Error - ${err.message}`),
              }}
              onDataUpdate={handleDataUpdate}
            />
          </Card>

          {/* Custom Configuration */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Custom Configuration
            </h3>
            <BrokerDataRefreshIndicator
              refreshOptions={{
                triggers,
                intervalMs: triggers.includes('interval') ? intervalMs : 0,
                staleAfterMs: 30000, // 30 seconds
                retryCount: 3,
                onSuccess: () => addLog('Custom: Success'),
                onError: (err) => addLog(`Custom: Error - ${err.message}`),
              }}
              onDataUpdate={handleDataUpdate}
            />
          </Card>

          {/* Minimal UI */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Minimal UI (Status Only)
            </h3>
            <BrokerDataRefreshIndicator
              refreshOptions={{
                triggers: ['mount', 'focus'],
                onSuccess: () => addLog('Minimal: Success'),
                onError: (err) => addLog(`Minimal: Error - ${err.message}`),
              }}
              showLastUpdate={false}
              showManualRefresh={false}
              onDataUpdate={handleDataUpdate}
            />
          </Card>

          {/* Filtered Broker Update */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Single Broker Update (Paper Only)
            </h3>
            <BrokerDataRefreshIndicator
              refreshOptions={{
                triggers: ['mount', 'manual'],
                brokerIds: ['alpaca_paper'],  // Only fetch paper trading data
                onSuccess: () => addLog('Paper Only: Success'),
                onError: (err) => addLog(`Paper Only: Error - ${err.message}`),
              }}
              onDataUpdate={handleDataUpdate}
            />
          </Card>

          {/* Hidden Status */}
          <Card>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Manual Refresh Only
            </h3>
            <BrokerDataRefreshIndicator
              refreshOptions={{
                triggers: ['manual'],
                onSuccess: () => addLog('Manual: Success'),
                onError: (err) => addLog(`Manual: Error - ${err.message}`),
              }}
              showStatus={false}
              showLastUpdate={false}
              onDataUpdate={handleDataUpdate}
            />
          </Card>
        </div>

        {/* Event Log */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Event Log</h3>
          <div className="space-y-1 font-mono text-sm">
            {eventLog.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No events yet...</p>
            ) : (
              eventLog.map((log, index) => (
                <div key={index} className="dark:text-gray-300 text-gray-700">
                  {log}
                </div>
              ))
            )}
          </div>
          {eventLog.length > 0 && (
            <Button
              variant="secondary"
              size="small"
              className="mt-4"
              onClick={() => setEventLog([])}
            >
              Clear Log
            </Button>
          )}
        </Card>

        {/* Last Fetched Data */}
        {lastData && (
          <Card className="mt-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Last Fetched Data
            </h3>
            <pre className="text-xs dark:text-gray-300 text-gray-700 overflow-auto">
              {JSON.stringify(lastData, null, 2)}
            </pre>
          </Card>
        )}
      </PageContent>
    </AppLayout>
  );
}