# Architecture Patterns - TrendDojo

*Quick reference for API design, data flow, and system architecture*
*Last Updated: 2025-09-05*

## tRPC API Patterns

### Standard tRPC Procedures
```typescript
// Protected procedure with context
export const tradingRouter = createTRPCRouter({
  getPositions: protectedProcedure
    .input(z.object({ 
      portfolioId: z.string(),
      status: z.enum(['open', 'closed']).optional() 
    }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.position.findMany({
        where: {
          portfolioId: input.portfolioId,
          userId: ctx.session.user.id,
          status: input.status
        }
      });
    }),
});
```

### Response Format
- Success: Return data directly (tRPC handles wrapping)
- Error: Throw `TRPCError` with appropriate codes
- Always validate inputs with Zod schemas

### Authentication Flow
- **NextAuth v5** with session-based auth
- Automatic session refresh
- User context included in all tRPC procedures
- Middleware handles protected routes

## Data Fetching Patterns

### Server Components with tRPC (Preferred)
```typescript
// app/portfolio/page.tsx (Server Component)
import { api } from '~/trpc/server';

export default async function PortfolioPage() {
  const positions = await api.trading.getPositions.query({
    portfolioId: 'default',
    status: 'open'
  });
  
  return <PositionsList positions={positions} />;
}
```

### Client Components with tRPC
```typescript
// components/positions-list.tsx (Client Component)
"use client";
import { api } from '~/trpc/react';

export function PositionsList({ initialPositions }) {
  const { data: positions, isLoading } = api.trading.getPositions.useQuery(
    { portfolioId: 'default' },
    { initialData: initialPositions }
  );
  
  // Handle real-time updates, optimistic updates
}
```

## Financial Data Architecture

### Price Data Handling
- **Real-time**: WebSocket connections to market data providers
- **Historical**: Cached in PostgreSQL with time-series optimization
- **Calculations**: Server-side only for accuracy
- **Display**: Client-side formatting only

### Position Management
```typescript
// Core position data structure
interface Position {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number; // Calculated server-side
  realizedPnL: number;
  riskAmount: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'closed';
  openedAt: Date;
  closedAt?: Date;
}
```

### Risk Management Layer
- **Position Size**: Calculated based on risk percentage
- **Portfolio Limits**: Maximum exposure per symbol/sector
- **Drawdown Protection**: Automatic position sizing reduction
- **Validation**: All risk calculations happen server-side

## Trading-Specific Patterns

### Order Flow
1. **Client**: User initiates trade
2. **Validation**: Risk checks, position sizing
3. **Broker API**: Execute via paper/live trading API
4. **Database**: Record position and audit trail
5. **Real-time**: Update UI via WebSocket

### Market Data Integration
- **Broker APIs**: Interactive Brokers, TD Ameritrade, etc.
- **Rate Limiting**: Respect API quotas
- **Fallbacks**: Multiple data sources for redundancy
- **Caching**: Smart caching for expensive calls

## Multi-User Security

### User Isolation
**EVERY** database query must filter by userId:
```typescript
where: { 
  userId: ctx.session.user.id,
  ...otherFilters 
}
```

### Financial Data Security
- Never expose other users' positions/trades
- Encrypt sensitive broker credentials
- Audit all financial operations
- Use UUIDs for public identifiers

## Error Handling

### Financial Operation Errors
- **Insufficient Funds**: Clear user messaging
- **Market Closed**: Prevent invalid orders
- **Risk Exceeded**: Block position increases
- **Broker API Errors**: Graceful degradation

### Data Integrity
- Transaction wrapping for multi-table updates
- Validation before financial calculations
- Audit trails for all position changes
- Rollback capabilities for failed operations

## State Management with Zustand

### Portfolio State
```typescript
interface PortfolioState {
  positions: Position[];
  totalValue: number;
  unrealizedPnL: number;
  dayChange: number;
  isLoading: boolean;
  updatePosition: (position: Position) => void;
  refreshPortfolio: () => void;
}
```

### Real-time Updates
- WebSocket integration with Zustand
- Optimistic updates for better UX
- Rollback mechanism for failed operations
- Selective re-rendering for performance

## Integration Patterns

### Broker API Integration
- **Environment Separation**: Paper trading for development
- **Error Recovery**: Retry logic with exponential backoff
- **Token Management**: Secure credential storage and refresh
- **Rate Limiting**: Built-in throttling

### Payment Processing (Airwallex)
- Subscription management
- Usage-based billing for premium features
- Secure card data handling
- Webhook verification

## Performance Patterns

### Financial Calculations
- **Server-side**: All P&L and risk calculations
- **Caching**: Expensive calculations cached with TTL
- **Batch Processing**: Multiple positions calculated together
- **Real-time**: Incremental updates vs full recalculation

### Chart Data
- **Time-series**: Optimized PostgreSQL queries
- **Compression**: Aggregate older data points
- **Streaming**: WebSocket for real-time chart updates
- **Client Caching**: Smart chart data caching

## Usage History
<!-- Add entries when this doc contributes to completing a task -->
<!-- Format: - YYYY-MM-DD: Used for WB-XXXX-XX-XXX (Brief description) -->
- 2025-09-05: Created for documentation harmonization (Trading-specific architecture patterns)