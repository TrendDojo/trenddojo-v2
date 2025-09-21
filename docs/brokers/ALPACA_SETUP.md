# Alpaca Broker Integration Setup

## Overview
TrendDojo now supports Alpaca for paper and live trading. Alpaca provides commission-free trading for US stocks with a powerful API.

## Features Implemented
✅ Complete AlpacaClient implementation with:
- Account information retrieval
- Position fetching
- Order placement (market, limit, stop, stop-limit)
- Real-time market data streaming via WebSocket
- Historical data retrieval
- Market status checking

✅ User Interface:
- Alpaca connection modal with credential input
- Paper/Live trading toggle
- Account balance and position display
- Connection status indicators

✅ API Integration:
- Secure broker connection endpoint
- BrokerManager orchestration
- Error handling and validation

## Getting Your Alpaca API Keys

### For Paper Trading (Recommended for Testing)
1. Go to [Alpaca Paper Trading Dashboard](https://app.alpaca.markets/paper/dashboard/overview)
2. Navigate to "API Keys" in the left sidebar
3. Make sure "Paper Trading" is selected at the top
4. Generate a new API key or use an existing one
5. Copy both the Key ID and Secret Key

### For Live Trading
1. Go to [Alpaca Live Trading Dashboard](https://app.alpaca.markets/brokerage/dashboard/overview)
2. Navigate to "API Keys" in the left sidebar
3. Make sure "Live Trading" is selected at the top
4. Generate a new API key with appropriate permissions
5. Copy both the Key ID and Secret Key

⚠️ **WARNING**: Live trading uses real money. Start with paper trading first.

## Testing Your Connection

### Method 1: Using the Test Script
```bash
# Set your credentials
export ALPACA_API_KEY_ID="your_key_id"
export ALPACA_SECRET_KEY="your_secret_key"

# Run the test
node scripts/test-alpaca.js
```

The test script will:
- Verify your credentials
- Fetch account information
- Check open positions
- Get market status
- Test market data access

### Method 2: Using the UI
1. Navigate to `/brokers` in the TrendDojo app
2. Click "Connect" on the Alpaca card
3. Enter your API credentials
4. Toggle Paper Trading ON (recommended)
5. Click "Connect Paper Account"

## Architecture

### Client Implementation
- **Location**: `/src/lib/brokers/alpaca/AlpacaClient.ts`
- **Interface**: Implements standard `BrokerClient` interface
- **Features**: Full trading capabilities, market data, WebSocket streaming

### API Route
- **Location**: `/src/app/api/brokers/connect/route.ts`
- **Security**: Requires authentication
- **Methods**: POST (connect), GET (status), DELETE (disconnect)

### UI Components
- **Modal**: `/src/components/brokers/AlpacaConnectionModal.tsx`
- **Page**: `/src/app/brokers/page.tsx`

## Security Considerations
- API credentials are never logged
- Credentials should be encrypted before database storage (pending implementation)
- Paper trading is enabled by default for safety
- Live trading shows multiple warnings

## Next Steps

### Immediate (NOW)
1. **Credential Encryption**: Implement AES-256 encryption for stored credentials
2. **Strategy Connection**: Link trading strategies to execute through Alpaca

### Future Enhancements (NEXT)
1. **Advanced Order Types**: OCO, bracket orders, trailing stops
2. **Options Trading**: When Alpaca adds options support
3. **Crypto Trading**: Alpaca supports crypto - add this capability
4. **Portfolio Analytics**: Real-time P&L tracking and performance metrics

### Long-term (LATER)
1. **Multi-broker Aggregation**: Trade across multiple brokers simultaneously
2. **Smart Order Routing**: Optimize execution across brokers
3. **Algorithmic Trading**: Advanced strategy execution

## Troubleshooting

### Common Issues

**Invalid Credentials Error**
- Verify you're using the correct API keys (paper vs live)
- Check that keys haven't expired
- Ensure no extra spaces in credentials

**Connection Timeout**
- Check your internet connection
- Verify Alpaca services are operational
- Try using different API endpoint (paper vs live)

**No Market Data**
- Free tier uses IEX data feed (15-min delayed)
- Upgrade to SIP feed for real-time data
- Check market hours (data may be limited outside trading hours)

## API Limits
- **Rate Limits**: 200 requests/minute for trading, unlimited for data
- **WebSocket**: Up to 1 connection for streaming
- **Historical Data**: Limited based on subscription level

## Support
- **Alpaca Documentation**: https://docs.alpaca.markets/
- **Status Page**: https://status.alpaca.markets/
- **Community**: https://forum.alpaca.markets/

---
*Last Updated: 2025-01-20*