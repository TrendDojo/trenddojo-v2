# Multi-Timeframe Chart Implementation

*Created: 2025-01-30*

## Overview
This document outlines the complete implementation strategy for multi-timeframe charts in TrendDojo, including current capabilities, future requirements, and contingency plans.

## Requirements

### User Experience Goals
- **Single-click simplicity**: User selects one button, gets optimal view
- **Consistent density**: Each view shows 50-150 candles for clarity
- **Fast performance**: No unnecessary API calls or calculations
- **Graceful degradation**: Work with available data, notify when limited

### Technical Requirements
- Support 5 timeframe presets: 1W, 1M, 3M, 1Y, ALL
- Each preset combines range + interval for optimal viewing
- Aggregate daily data into weekly/monthly bars
- Prepare for future intraday data integration
- Handle edge cases (missing data, weekends, holidays)

## Current Data Architecture

### Available Data
```
SQLite Database: /data/market/trenddojo.db
- Table: daily_prices
- Symbols: 100
- Date Range: Sep 25, 2020 - Jan 24, 2025
- Granularity: Daily only (market days)
```

### Preset Requirements
| Preset | Range    | Interval | Candles | Data Source        | Status      |
|--------|----------|----------|---------|-------------------|-------------|
| 1W     | 1 week   | 1 hour   | ~65     | Polygon API       | Not Available |
| 1M     | 1 month  | 4 hour   | ~66     | Polygon API       | Not Available |
| 3M     | 3 months | Daily    | ~66     | SQLite (daily)    | ✅ Working   |
| 1Y     | 1 year   | Weekly   | 52      | Aggregate daily   | 🔧 Need to implement |
| ALL    | 5 years  | Monthly  | 60      | Aggregate daily   | 🔧 Need to implement |

## Implementation Plan

### Phase 1: Data Aggregation (NOW)
Implement server-side aggregation to create weekly and monthly bars from daily data.

#### Weekly Aggregation Logic
```javascript
// Weekly bars (Monday to Friday)
// - Open: Monday's open (or first available day)
// - High: Highest high of the week
// - Low: Lowest low of the week
// - Close: Friday's close (or last available day)
// - Volume: Sum of all daily volumes
```

#### Monthly Aggregation Logic
```javascript
// Monthly bars (calendar month)
// - Open: First trading day's open
// - High: Highest high of the month
// - Low: Lowest low of the month
// - Close: Last trading day's close
// - Volume: Sum of all daily volumes
```

### Phase 2: API Enhancement (NOW)
Update `/api/market-data/history/[symbol]` to:
1. Accept `interval` parameter
2. Return appropriate data based on interval
3. Handle aggregation server-side for performance

#### API Request Format
```
GET /api/market-data/history/AAPL?from=2024-01-01&to=2025-01-24&interval=1W
```

#### Response Format
```json
{
  "symbol": "AAPL",
  "interval": "1W",
  "data": [
    {
      "time": "2024-01-01",  // Week starting date
      "open": 150.00,
      "high": 155.00,
      "low": 149.00,
      "close": 154.00,
      "volume": 50000000
    }
  ]
}
```

### Phase 3: Frontend Integration (NOW)
1. Update LocalChart to pass interval to API
2. Handle different interval responses
3. Display interval indicator on chart
4. Show data limitations when applicable

### Phase 4: Intraday Preparation (FUTURE)
When Polygon API is integrated:
1. Create new endpoints for intraday data
2. Implement caching strategy
3. Handle extended hours options
4. Manage rate limits

## Edge Cases & Contingencies

### 1. Missing Data
**Problem**: Weekends, holidays, or data gaps
**Solution**:
- Skip missing days in aggregation
- Use previous close for next open if gap exists
- Never show empty bars

### 2. Partial Periods
**Problem**: Current week/month not complete
**Solution**:
- Include partial periods with available data
- Mark as "in progress" in UI if needed
- Update as new data arrives

### 3. Market Hours
**Problem**: Intraday data needs market hours consideration
**Solution**:
- Regular hours only for initial implementation
- Extended hours as optional enhancement
- Clear labeling of data coverage

### 4. Performance
**Problem**: Aggregation could be slow for many symbols
**Solution**:
- Cache aggregated data
- Background jobs for pre-aggregation
- Incremental updates

### 5. Data Freshness
**Problem**: User expects real-time but we have EOD
**Solution**:
- Clear "Daily data through [date]" indicator
- Sync status in UI
- Automatic refresh when new data available

## Testing Strategy

### Unit Tests
- [ ] Weekly aggregation with complete weeks
- [ ] Weekly aggregation with partial weeks
- [ ] Monthly aggregation with complete months
- [ ] Monthly aggregation with partial months
- [ ] Holiday handling
- [ ] Weekend skipping

### Integration Tests
- [ ] API with interval=1D (daily)
- [ ] API with interval=1W (weekly)
- [ ] API with interval=1M (monthly)
- [ ] Chart rendering with each interval
- [ ] Preset switching
- [ ] Data range calculations

### Edge Case Tests
- [ ] Symbol with missing data
- [ ] Date range with no data
- [ ] Current incomplete week/month
- [ ] Year boundary crossing
- [ ] Timezone handling

## Rollback Plan
If issues arise:
1. **Quick fix**: Remove interval parameter, return daily only
2. **Partial rollback**: Disable weekly/monthly, keep daily
3. **Full rollback**: Revert to previous simple controls
4. **Data integrity**: Never modify original daily data

## Success Metrics
- [ ] All 5 presets show appropriate candle density
- [ ] Weekly/monthly aggregation < 100ms
- [ ] No data inconsistencies
- [ ] Clear user communication about data limitations
- [ ] Smooth upgrade path for intraday data

## Future Enhancements
1. **Intraday Data** (via Polygon API)
   - 1-minute, 5-minute, 15-minute, 30-minute bars
   - Extended hours option
   - Real-time updates via WebSocket

2. **Advanced Aggregation**
   - Custom period aggregation
   - Volume-weighted calculations
   - Market profile views

3. **Performance Optimization**
   - Pre-calculated aggregations
   - Materialized views
   - Client-side caching

## Current Implementation Status
- ✅ UI controls implemented
- ✅ Preset structure defined
- ✅ Weekly aggregation implemented
- ✅ Monthly aggregation implemented
- ✅ API interval parameter added
- ✅ Chart integration with intervals
- ✅ Partial period handling
- ✅ Intraday fallback with warnings
- ⏳ Intraday data (future - requires Polygon API)

---

*This is a living document. Update as implementation progresses.*