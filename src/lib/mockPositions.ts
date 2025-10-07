// Mock positions for dev mode testing
// These match the real database structure exactly

export interface Position {
  id: string;
  symbol: string;
  name?: string | null;
  side: "long" | "short";
  direction: "long" | "short";
  quantity: number;
  currentQuantity: number;
  originalQuantity: number;
  entryPrice: number;
  avgEntryPrice: number;
  currentPrice: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  targetPrice?: number;
  pnl: number;
  unrealizedPnl: number;
  realizedPnl: number;
  netPnl: number;
  pnlPercent: number;
  value: number;
  totalFees: number;
  maxGainPercent?: number;
  maxLossPercent?: number;
  holdingDays?: number;
  rMultiple?: number;
  openDate: string;
  openedAt: string;
  lastExecutionAt?: string;
  closedDate?: string;
  closedAt?: string | null;
  exitPrice?: number;
  avgExitPrice?: number | null;
  strategy: string;
  strategyId?: string;
  status: string;
  assetType?: string;
  exitReason?: string;
  broker?: string;
  tradingMode?: string;
  source?: string;
  externalBroker?: string;
  totalCommissions?: number;
  scalingLevels?: Array<{
    quantity: number;
    targetPrice: number;
    executed: boolean;
    executedPrice?: number;
    executedDate?: string;
  }>;
  executions?: Array<{
    id: string;
    date: string;
    type: string;
    quantity: number;
    price: number;
    fees: number;
  }>;
  notes?: Array<{
    id: string;
    date: string;
    content: string;
    noteType: string;
  }>;
}

export const DEV_POSITIONS: Position[] = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    side: "long",
    direction: "long",
    quantity: 100,
    currentQuantity: 100,
    originalQuantity: 100,
    entryPrice: 175.50,
    avgEntryPrice: 175.50,
    currentPrice: 182.30,
    stopLoss: 170.00,
    takeProfit: 190.00,
    targetPrice: 195.00,
    pnl: 680.00,
    unrealizedPnl: 680.00,
    realizedPnl: 0,
    netPnl: 680.00,
    pnlPercent: 3.87,
    value: 18230.00,
    totalFees: 0,
    maxGainPercent: 3.87,
    maxLossPercent: 0,
    holdingDays: 23,
    rMultiple: 1.23,
    openDate: "2024-01-15",
    openedAt: "2024-01-15T09:30:00Z",
    lastExecutionAt: "2024-01-15T09:30:00Z",
    strategy: "Momentum",
    strategyId: "1",
    status: "active",
    assetType: "stock",
    broker: "alpaca_paper",
    tradingMode: "paper",
    source: "broker_api",
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
