"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PositionStatusBar } from "@/components/positions/PositionStatusBar";
import { refreshCoordinator } from "@/lib/refresh/RefreshCoordinator";
import { ChevronLeft, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Target, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { tableStyles, getTableRow } from "@/lib/tableStyles";

interface Position {
  id: string;
  symbol: string;
  name: string | null;
  strategy: string;
  strategyId: string | null;
  direction: string;
  status: string;
  currentQuantity: number;
  avgEntryPrice: number;
  currentPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  totalFees: number;
  openedAt: Date;
  closedAt: Date | null;
  lastExecutionAt: Date;
  holdingDays: number;
  maxGainPercent: number;
  maxLossPercent: number;
  rMultiple: number;
  source: string;
  brokerAccountId: string | null;
  executions: Array<{
    id: string;
    date: Date;
    type: string;
    quantity: number;
    price: number;
    fees: number;
    notes: string | null;
    brokerOrderId: string | null;
  }>;
  notes: Array<{
    id: string;
    date: Date;
    content: string;
    noteType: string;
  }>;
}

// Mock dev positions data
const DEV_POSITIONS: any[] = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    direction: "long",
    currentQuantity: 100,
    avgEntryPrice: 175.50,
    currentPrice: 182.30,
    stopLoss: 170.00,
    takeProfit: 190.00,
    unrealizedPnl: 680.00,
    unrealizedPnlPercent: 3.87,
    realizedPnl: 0,
    totalFees: 0,
    maxGainPercent: 3.87,
    maxLossPercent: 0,
    holdingDays: 23,
    rMultiple: 1.23,
    openedAt: "2024-01-15T09:30:00Z",
    lastExecutionAt: "2024-01-15T09:30:00Z",
    status: "open",
    strategies: { name: "Momentum", type: "momentum" },
    executions: [
      {
        id: "e1",
        date: "2024-01-15T09:30:00Z",
        type: "buy",
        quantity: 100,
        price: 175.50,
        fees: 0
      }
    ],
    notes: [
      {
        id: "n1",
        date: "2024-01-15T09:30:00Z",
        content: "Strong momentum breakout above 50-day MA",
        noteType: "entry"
      }
    ]
  }
];

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosition() {
      try {
        setLoading(true);

        // Check if this is a dev position (numeric ID 1-20)
        const positionId = params.id as string;
        const numericId = parseInt(positionId);

        if (!isNaN(numericId) && numericId >= 1 && numericId <= 20) {
          // Use mock data for dev positions
          const devPosition = DEV_POSITIONS.find(p => p.id === positionId);
          if (devPosition) {
            setPosition(devPosition);
            setLoading(false);
            return;
          }
        }

        // Fetch real position from API
        const response = await fetch(`/api/positions/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch position');
        }

        const data = await response.json();
        setPosition(data);
      } catch (err) {
        console.error('Error fetching position:', err);
        setError(err instanceof Error ? err.message : 'Failed to load position');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchPosition();
    }
  }, [params.id]);

  // Subscribe to market-data refresh events for real-time price updates
  useEffect(() => {
    if (!position?.symbol) return;

    const symbol = position.symbol; // Capture symbol for type safety

    async function fetchPrice() {
      try {
        const response = await fetch(`/api/market-data/quote/${symbol}`);
        if (response.ok) {
          const data = await response.json();
          setPosition(prev => {
            if (!prev) return prev;
            // Update current price and recalculate unrealized P&L
            const newPrice = data.price;
            const avgEntry = prev.avgEntryPrice;
            const quantity = prev.currentQuantity;

            let newUnrealizedPnl = 0;
            if (prev.direction === 'long') {
              newUnrealizedPnl = (newPrice - avgEntry) * quantity;
            } else {
              newUnrealizedPnl = (avgEntry - newPrice) * quantity;
            }

            const newUnrealizedPnlPercent = (newUnrealizedPnl / (avgEntry * quantity)) * 100;

            return {
              ...prev,
              currentPrice: newPrice,
              unrealizedPnl: newUnrealizedPnl,
              unrealizedPnlPercent: newUnrealizedPnlPercent
            };
          });
        }
      } catch (err) {
        console.error('Error fetching price:', err);
      }
    }

    // Fetch immediately
    fetchPrice();

    // Subscribe to coordinated market-data refresh events
    const unsubscribe = refreshCoordinator.subscribe('market-data', async () => {
      await fetchPrice();
    });

    return unsubscribe;
  }, [position?.symbol]);

  if (loading) {
    return (
      <PageContent>
        <div className="flex items-center justify-center min-h-[70vh]">
          <Spinner text="Loading position..." />
        </div>
      </PageContent>
    );
  }

  if (error || !position) {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <AlertTriangle className="w-12 h-12 text-danger mb-4" />
          <p className="text-danger text-lg mb-4">{error || 'Position not found'}</p>
          <Button onClick={() => router.push('/app/positions')}>
            Back to Positions
          </Button>
        </div>
      </PageContent>
    );
  }

  return (
    
      <PageContent>
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: "Positions", href: "/app/positions" },
              { label: position.symbol }
            ]}
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold dark:text-white text-gray-900">
                {position.symbol}
              </h1>
              <span className="text-lg dark:text-gray-400 text-gray-600">
                {position.name}
              </span>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                position.status === "open"
                  ? "bg-success/20 text-success"
                  : "dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700"
              )}>
                {position.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm dark:text-gray-400 text-gray-600">
                Strategy: {position.strategy}
              </span>
              <span className="text-sm dark:text-gray-400 text-gray-600">
                Direction: {position.direction.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              Edit Position
            </Button>
            <Button variant="danger" size="sm">
              Close Position
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex gap-16 mb-8">
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Current Price</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              ${position.currentPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Unrealized P&L</p>
            <p className={cn(
              "text-2xl font-bold",
              position.unrealizedPnl >= 0 ? "text-success" : "text-danger"
            )}>
              ${position.unrealizedPnl.toFixed(2)}
              <span className="text-sm ml-2">
                ({position.unrealizedPnlPercent >= 0 ? "+" : ""}{position.unrealizedPnlPercent.toFixed(2)}%)
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Position Size</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              {position.currentQuantity} shares
            </p>
          </div>
          <div>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Avg Entry</p>
            <p className="text-2xl font-bold dark:text-white text-gray-900">
              ${position.avgEntryPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Position Status Bar */}
        <div className="mb-8 flex justify-center">
          <PositionStatusBar
            side={position.direction as "long" | "short"}
            quantity={position.currentQuantity}
            originalQuantity={position.currentQuantity}
            entryPrice={position.avgEntryPrice}
            currentPrice={position.currentPrice}
            stopLoss={position.stopLoss || undefined}
            targetPrice={position.takeProfit || undefined}
            status={position.status as "active" | "pending" | "closed"}
            pnl={position.unrealizedPnl}
            size="lg"
          />
        </div>

        {/* Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Management */}
          <div>
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
              Risk Management
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-600">Stop Loss</span>
                <span className="font-medium text-danger">
                  {position.stopLoss ? `$${position.stopLoss.toFixed(2)}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-600">Take Profit</span>
                <span className="font-medium text-success">
                  {position.takeProfit ? `$${position.takeProfit.toFixed(2)}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-600">Risk Multiple</span>
                <span className="font-medium dark:text-white text-gray-900">
                  {position.rMultiple.toFixed(1)}R
                </span>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div>
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
              Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-600">Max Gain</span>
                <span className="font-medium text-success">
                  +{position.maxGainPercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-600">Max Loss</span>
                <span className="font-medium text-danger">
                  {position.maxLossPercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="dark:text-gray-400 text-gray-600">Holding Days</span>
                <span className="font-medium dark:text-white text-gray-900">
                  {position.holdingDays} days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Activity Table - Executions and Notes */}
        <div>
          <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
            Activity History
          </h3>
          <div className={tableStyles.wrapper}>
            <div className="overflow-x-auto">
              <table className={tableStyles.table}>
              <thead className={tableStyles.thead}>
                <tr className={tableStyles.headerRow}>
                  <th className={tableStyles.th}>
                    Date
                  </th>
                  <th className={tableStyles.th}>
                    Type
                  </th>
                  <th className={tableStyles.th}>
                    Details
                  </th>
                  <th className={tableStyles.thRight}>
                    Quantity
                  </th>
                  <th className={tableStyles.thRight}>
                    Price
                  </th>
                  <th className={tableStyles.thRight}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className={tableStyles.tbody}>
                {/* Combine executions and notes and sort by date */}
                {[
                  ...position.executions.map(exec => ({
                    date: exec.date,
                    type: 'execution',
                    subType: exec.type,
                    quantity: exec.quantity,
                    price: exec.price,
                    fees: exec.fees,
                    total: exec.quantity * exec.price + exec.fees
                  })),
                  ...position.notes.map(note => ({
                    date: note.date,
                    type: 'note',
                    content: note.content
                  }))
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((item, idx) => (
                    <tr key={idx} className={getTableRow(idx)}>
                      <td className={tableStyles.td}>
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className={tableStyles.td}>
                        {item.type === 'execution' ? (
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            'subType' in item && item.subType === "buy"
                              ? "bg-success/20 text-success"
                              : "bg-danger/20 text-danger"
                          )}>
                            {'subType' in item ? item.subType?.toUpperCase() : ''}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            NOTE
                          </span>
                        )}
                      </td>
                      <td className={tableStyles.td}>
                        {item.type === 'note' ? ('content' in item ? item.content : '') : ('fees' in item && item.fees ? `Fees: $${item.fees.toFixed(2)}` : '—')}
                      </td>
                      <td className={tableStyles.tdRight}>
                        {item.type === 'execution' ? ('quantity' in item ? item.quantity : '') : '—'}
                      </td>
                      <td className={tableStyles.tdRight}>
                        {item.type === 'execution' ? ('price' in item && item.price ? `$${item.price.toFixed(2)}` : '') : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium dark:text-white text-gray-900">
                        {item.type === 'execution' ? ('total' in item && item.total ? `$${item.total.toFixed(2)}` : '') : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm">
              Add Note
            </Button>
          </div>
        </div>
      </PageContent>
    
  );
}