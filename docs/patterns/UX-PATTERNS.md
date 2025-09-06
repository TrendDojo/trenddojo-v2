# UX Patterns - TrendDojo

*Quick reference for user interaction patterns and trading-specific behaviors*
*Last Updated: 2025-09-05*

## Form Behavior

### Trading Forms (Orders, Settings)
- **Immediate Validation**: Risk calculations update in real-time
- **Confirmation Required**: All order submissions require confirmation
- **Safety Checks**: Warn if position size exceeds risk limits
- **Price Validation**: Check if prices are within reasonable ranges
- **Reset Behavior**: Forms clear after successful order submission

### Validation Flow for Trading
1. **Real-time**: Position size, P&L calculations update as user types
2. **Pre-submit**: Risk validation, buying power checks
3. **Confirmation**: Show order summary with all costs/risks
4. **Error Handling**: Clear financial terminology for error messages

### Multi-Step Trading Flows
- **Strategy Setup**: Risk parameters → Position sizing → Order details
- **Portfolio Review**: Holdings → Performance → Risk assessment
- **Trade Analysis**: Entry → Management → Exit review

## Trading-Specific Modal Patterns

### Modal Types
- **Position Modal**: View/edit open positions with P&L
- **Order Modal**: Place new trades with risk calculation
- **Risk Dialog**: Confirm trades exceeding risk parameters
- **Analysis Modal**: Detailed trade analysis and charts

### Trading Context in Modals
- Always show current position size and risk
- Include relevant market data (price, volume, volatility)
- Display account buying power and margin usage
- Show related positions in same symbol/sector

## Loading States for Trading

### Real-time Data
- **Price Updates**: Smooth number transitions, no jarring changes
- **Chart Loading**: Progressive loading with skeleton chart structure
- **Market Status**: Clear indicators when markets closed/delayed
- **Connection Status**: WebSocket connection state visible

### Order Execution
- **Instant**: Local validation feedback
- **0-3 seconds**: Order submission to broker
- **3+ seconds**: Show "Waiting for confirmation" with ability to cancel
- **Long delays**: Market status explanation and retry options

## Error Handling for Trading

### Financial Error Messages
- **Insufficient Funds**: "Not enough buying power. Available: $X, Required: $Y"
- **Market Closed**: "Market closed. Order will be placed when market opens"
- **Invalid Price**: "Price $X is outside daily range $Y-$Z"
- **Risk Exceeded**: "Position would exceed 5% portfolio limit (currently 3.2%)"

### Connection Errors
- **Real-time Data**: "Price data delayed - last update 2 minutes ago"
- **Order Errors**: "Order failed - please try again or contact support"
- **API Limits**: "Too many requests - please wait 30 seconds"

## Trading-Specific Empty States

### Portfolio Views
- **No Positions**: "No open positions. Start by analyzing a stock or using our screener"
- **No History**: "No completed trades yet. Your trading history will appear here"
- **No Watchlist**: "Build your watchlist to track stocks you're interested in"

### Analysis Views
- **No Data**: "Not enough data for analysis. Try a different time period"
- **Market Closed**: "Charts will update when market opens at 9:30 AM EST"

## Data Tables for Trading

### Position Tables
- **Sortable**: By P&L, position size, symbol, % change
- **Color Coding**: Green for profit, red for loss, gray for flat
- **Real-time Updates**: Prices and P&L update every second
- **Quick Actions**: Close position, adjust stop loss, add to position

### Trade History
- **Filters**: Date range, symbol, profit/loss, strategy
- **Export**: CSV download for tax reporting
- **Analysis**: Click trade for detailed analysis modal
- **Performance**: Running totals and statistics

### Responsive Trading Tables
- **Mobile**: Stack most important columns (symbol, P&L, % change)
- **Tablet**: Show core data with horizontal scroll for details
- **Desktop**: Full data with real-time updates

## Confirmation Patterns for Trading

### Order Confirmation
- **Summary**: Symbol, quantity, price, estimated cost
- **Risk**: Position size as % of portfolio, stop loss level
- **Impact**: New portfolio balance, buying power remaining
- **Safety**: "Are you sure?" with order details repeated

### Position Management
- **Close Position**: Show current P&L and final proceeds
- **Risk Changes**: Confirm new stop loss/take profit levels
- **Size Changes**: Adding to winner vs. adding to loser warnings

## Trading-Specific Accessibility

### Screen Reader Support
- **Price Changes**: "AAPL up $2.50 to $150.25, up 1.69%"
- **P&L Updates**: "Position profit increased to $450.30"
- **Order Status**: "Order submitted successfully for 100 shares"
- **Alerts**: "Stop loss triggered for MSFT position"

### Visual Accessibility
- **Color Independence**: P&L shown with +/- symbols, not just color
- **High Contrast**: Financial data readable in all lighting conditions
- **Text Scaling**: Numbers remain aligned when text size increased

## Real-time Update Patterns

### Price Display
- **Smooth Transitions**: Animate price changes, not jarring jumps
- **Highlight Changes**: Brief highlight on price update
- **Time Stamps**: Show last update time for transparency
- **Stale Data**: Gray out prices when data is stale

### Portfolio Updates
- **Incremental**: Update changed positions only
- **Batching**: Group updates to prevent UI thrashing
- **Priority**: P&L changes get priority over other updates
- **Offline**: Clear indication when real-time data unavailable

## Mobile Trading Patterns

### Touch Targets
- **Order Buttons**: Large, easy to tap (min 48x48px)
- **Price Fields**: Big enough for fat fingers
- **Swipe Actions**: Swipe to close position or adjust stop loss
- **Pull to Refresh**: Update prices and positions

### Mobile-Specific Features
- **Quick Actions**: Floating action button for new order
- **Gesture Support**: Pinch to zoom on charts
- **Portrait Optimization**: Vertical layout for position lists
- **Haptic Feedback**: Vibration for order confirmations

## Performance Patterns

### Chart Performance
- **Progressive Loading**: Show basic chart then add indicators
- **Viewport Rendering**: Only render visible chart area
- **Smooth Animations**: 60fps for real-time updates
- **Memory Management**: Clean up old chart data

### List Performance
- **Virtual Scrolling**: For large position/watchlists
- **Lazy Loading**: Load position details on demand
- **Efficient Updates**: Only re-render changed items
- **Background Sync**: Update data without blocking UI

## Usage History
<!-- Add entries when this doc contributes to completing a task -->
<!-- Format: - YYYY-MM-DD: Used for WB-XXXX-XX-XXX (Brief description) -->
- 2025-09-05: Created for documentation harmonization (Trading-specific UX patterns)