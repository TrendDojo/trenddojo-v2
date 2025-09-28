# TrendDojo UI Components Specification

*Last updated: 2025-09-28*
*Extracted from: trenddojo-setup-technical-spec.md*

## Overview

This document specifies all UI components for TrendDojo, including marketing pages, trading interfaces, and subscription management. Components use Tailwind CSS, Shadcn/ui, and Framer Motion for animations.

**IMPORTANT**: Before implementing any UI component, read the [Design System](../DESIGN_SYSTEM.md) for colors, spacing, and shared component requirements.

## Marketing Components

### Marketing Layout

Polygon.io-inspired design with dark gradient background.

```typescript
// src/app/(marketing)/layout.tsx
export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  );
}
```

### Landing Page Structure

```typescript
// src/app/(marketing)/page.tsx
const LandingPage: React.FC = () => {
  return (
    <>
      {/* Hero Section with animated polygons */}
      <section className="relative overflow-hidden">
        <AnimatedPolygonBackground />
        <div className="relative z-10 container mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-white mb-6">
              Trade with <span className="text-indigo-400">Discipline</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Professional position sizing, risk management, and trade journaling
              for serious traders who want consistent results.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white">
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Built for Traders, by Traders
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live Data Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Real-Time Market Data
              </h3>
              <p className="text-gray-300 mb-4">
                Connect to institutional-grade data feeds. Get accurate prices,
                live charts, and instant position calculations.
              </p>
              <ul className="space-y-3">
                {dataFeatures.map(item => (
                  <li key={item} className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <LiveDataDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Try It Now
          </h2>
          <InteractivePositionCalculator />
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* Pricing */}
      <PricingSection />

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Trading with Confidence
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of traders who've improved their consistency
          </p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
            Get Started Free
          </Button>
        </div>
      </section>
    </>
  );
};
```

### Animated Polygon Background

SVG-based animated background with Framer Motion.

```typescript
// src/components/marketing/AnimatedPolygonBackground.tsx
const AnimatedPolygonBackground: React.FC = () => {
  return (
    <div className="absolute inset-0">
      <svg className="w-full h-full" viewBox="0 0 1200 800">
        {/* Animated polygons using Framer Motion */}
        {polygons.map((poly, i) => (
          <motion.polygon
            key={i}
            points={poly.points}
            fill={poly.fill}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              delay: i * 0.2,
              repeat: Infinity
            }}
          />
        ))}
      </svg>
    </div>
  );
};
```

### Live Data Demo

Interactive price display with mock real-time updates.

```typescript
// src/components/marketing/LiveDataDemo.tsx
const LiveDataDemo: React.FC = () => {
  const [price, setPrice] = useState(145.32);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white font-semibold">AAPL</span>
        <span className="text-green-400 text-2xl font-mono">
          ${price.toFixed(2)}
        </span>
      </div>
      <MiniChart data={generateMockData(price)} />
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-gray-400 text-sm">Position Size</p>
          <p className="text-white font-bold">342 shares</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Risk</p>
          <p className="text-white font-bold">1.5%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">R:R</p>
          <p className="text-white font-bold">1:2.5</p>
        </div>
      </div>
    </div>
  );
};
```

## Subscription Components

### Pricing Card

Displays subscription tiers with Airwallex integration.

```typescript
// src/components/subscription/PricingCard.tsx
const PricingCard: React.FC<{ tier: 'free' | 'starter' | 'basic' | 'pro' }> = ({ tier }) => {
  const { mutate: checkout } = api.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    }
  });

  const features = {
    free: [
      '1 active position',
      '1 account',
      '5 screener results',
      '15 minute data refresh',
      'Basic charts'
    ],
    starter: [
      '5 active positions',
      '2 accounts',
      '25 screener results',
      '5 minute data refresh',
      'Broker integration'
    ],
    basic: [
      '15 active positions',
      '3 accounts',
      '50 screener results',
      '1 minute data refresh',
      'Fundamental data',
      'Email alerts'
    ],
    pro: [
      '100 positions',
      '10 accounts',
      '200 screener results',
      'Real-time data',
      'All fundamentals',
      'API access',
      'Priority support'
    ]
  };

  const prices = {
    free: 0,
    starter: 4.99,
    basic: 14.99,
    pro: 39.99
  };

  return (
    <Card className={tier === 'basic' ? 'border-blue-500 border-2' : ''}>
      <CardHeader>
        <h3 className="text-2xl font-bold capitalize">{tier}</h3>
        <p className="text-3xl font-bold">
          ${prices[tier]}
          {tier !== 'free' && <span className="text-sm">/month</span>}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features[tier].map(feature => (
            <li key={feature} className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>

        {tier !== 'free' && (
          <Button
            className="w-full mt-4"
            onClick={() => checkout({ tier, annual: false })}
          >
            Start {tier === 'basic' ? '7-day' : '14-day'} Free Trial
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
```

### Upgrade Prompt

Shows when users hit subscription limits.

```typescript
// src/components/subscription/UpgradePrompt.tsx
const UpgradePrompt: React.FC<{ feature: string }> = ({ feature }) => {
  return (
    <Alert className="border-amber-500">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Upgrade Required</AlertTitle>
      <AlertDescription>
        {feature} requires a Pro subscription.
        <Link href="/pricing" className="ml-2 underline">
          View pricing →
        </Link>
      </AlertDescription>
    </Alert>
  );
};
```

### Usage Bar

Displays current usage against subscription limits.

```typescript
// src/components/subscription/UsageBar.tsx
const UsageBar: React.FC = () => {
  const { data: status } = api.subscription.getStatus.useQuery();

  if (!status) return null;

  const { data: usage } = api.trade.getUsage.useQuery();

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Positions Used</span>
        <span className="text-sm">
          {usage?.activePositions} / {status.limits.max_positions}
        </span>
      </div>
      <Progress
        value={(usage?.activePositions / status.limits.max_positions) * 100}
        className={usage?.activePositions >= status.limits.max_positions ? 'bg-red-500' : ''}
      />

      {usage?.activePositions >= status.limits.max_positions * 0.8 && (
        <p className="text-xs text-amber-600 mt-2">
          Approaching position limit.
          <Link href="/pricing" className="underline ml-1">
            Upgrade for more
          </Link>
        </p>
      )}
    </div>
  );
};
```

## Trading Components

### Position Sizer

Interactive position sizing calculator with validation.

```typescript
// src/components/position-sizer/PositionSizer.tsx
const PositionSizer: React.FC = ({ accountBalance, symbol }) => {
  const [entry, setEntry] = useState('');
  const [stop, setStop] = useState('');
  const [target, setTarget] = useState('');
  const [riskPercent, setRiskPercent] = useState(1.0);

  const { mutate: calculate } = api.trade.calculatePosition.useMutation({
    onSuccess: (data) => {
      positionStore.setCalculation(data);
      toast.success(`Position: ${data.positionSize} units`);
    }
  });

  return (
    <Card>
      <CardHeader>Position Calculator</CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Input
            label="Entry Price"
            value={entry}
            onChange={setEntry}
            type="number"
            step="0.01"
          />
          <Input
            label="Stop Loss"
            value={stop}
            onChange={setStop}
            type="number"
            step="0.01"
          />
          <Input
            label="Target (Optional)"
            value={target}
            onChange={setTarget}
            type="number"
            step="0.01"
          />
          <Slider
            label={`Risk: ${riskPercent}%`}
            min={0.25}
            max={3}
            step={0.25}
            value={riskPercent}
            onChange={setRiskPercent}
          />
          <Button onClick={() => calculate({
            accountBalance,
            riskPercent,
            entryPrice: parseFloat(entry),
            stopLoss: parseFloat(stop),
            targetPrice: target ? parseFloat(target) : null
          })}>
            Calculate Position
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

### Position Chart

Recharts-based chart with trading levels overlay.

```typescript
// src/components/positions/PositionChart.tsx
const PositionChart: React.FC<{ position: Position }> = ({ position }) => {
  const { data: priceHistory } = api.marketData.getPriceHistory.useQuery({
    symbol: position.symbol,
    timeframe: position.timeframe || '1h',
    limit: 100
  });

  if (!priceHistory) return <Skeleton />;

  // Format data for Recharts
  const chartData = priceHistory.map(candle => ({
    time: format(candle.timestamp, 'HH:mm'),
    price: candle.close,
    high: candle.high,
    low: candle.low
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
        <Tooltip />

        {/* Price line */}
        <Line
          type="monotone"
          dataKey="price"
          stroke="#8884d8"
          dot={false}
          strokeWidth={2}
        />

        {/* Entry line */}
        <ReferenceLine
          y={position.entryPrice}
          stroke="green"
          strokeWidth={2}
          label={{ value: "Entry", position: "right" }}
        />

        {/* Stop loss line */}
        <ReferenceLine
          y={position.stopLoss}
          stroke="red"
          strokeWidth={2}
          strokeDasharray="5 5"
          label={{ value: "Stop", position: "right" }}
        />

        {/* Target line */}
        {position.targetPrice && (
          <ReferenceLine
            y={position.targetPrice}
            stroke="blue"
            strokeWidth={2}
            label={{ value: "Target", position: "right" }}
          />
        )}

        {/* Risk zone (entry to stop) */}
        <ReferenceArea
          y1={position.entryPrice}
          y2={position.stopLoss}
          fill="red"
          fillOpacity={0.1}
        />

        {/* Profit zone (entry to target) */}
        {position.targetPrice && (
          <ReferenceArea
            y1={position.entryPrice}
            y2={position.targetPrice}
            fill="green"
            fillOpacity={0.1}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### Active Positions Display

Comprehensive position management interface.

```typescript
// src/components/positions/ActivePositions.tsx
const ActivePositions: React.FC = () => {
  const { data: positions } = api.trade.getActive.useQuery();

  return (
    <div className="grid gap-4">
      {positions?.map(position => (
        <PositionCard key={position.id}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">
                {position.symbol} - {position.position_label || position.timeframe}
              </h3>
              <p className="text-sm text-gray-500">
                Entry: ${position.entryPrice} | Size: {position.quantity}
              </p>
            </div>
            <PnLDisplay
              amount={position.unrealizedPnl}
              percent={position.unrealizedPnlPercent}
              rMultiple={position.currentRMultiple}
            />
          </div>

          {/* Chart with overlays */}
          <PositionChart position={position} />

          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500">To Stop:</span>
              <span className="ml-2 font-mono">
                {position.percentToStop.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">To Target:</span>
              <span className="ml-2 font-mono">
                {position.percentToTarget.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">R-Multiple:</span>
              <span className="ml-2 font-mono">
                {position.currentRMultiple.toFixed(2)}R
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => adjustStop(position)}>
              Adjust Stop
            </Button>
            <Button size="sm" variant="outline">
              Add Note
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => closePosition(position.id)}
            >
              Close Position
            </Button>
          </div>
        </PositionCard>
      ))}
    </div>
  );
};
```

## Screener Components

### Stock Screener Interface

Advanced filtering with real-time results.

```typescript
// src/components/screener/Screener.tsx
const Screener: React.FC = () => {
  const [filters, setFilters] = useState<ScreenerFilters>({
    priceMin: 5,
    priceMax: 500,
    volumeMin: 100000,
    aboveSMA50: true,
    excludeExisting: true
  });

  const { data: results, refetch } = api.screener.runScreener.useQuery({
    filters,
    accountId: currentAccount.id
  });

  const { data: presets } = api.screener.getPresets.useQuery();

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Stock Screener</h2>
            <Select
              value={selectedPreset}
              onChange={(preset) => setFilters(preset.filters)}
            >
              <option value="">Custom</option>
              {presets?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* Price Filters */}
            <div>
              <Label>Price Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceMin: parseFloat(e.target.value)
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceMax: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>

            {/* Technical Filters */}
            <div>
              <Label>Technical</Label>
              <div className="space-y-2">
                <Checkbox
                  label="Above 50 SMA"
                  checked={filters.aboveSMA50}
                  onChange={(checked) => setFilters({
                    ...filters,
                    aboveSMA50: checked
                  })}
                />
                <Checkbox
                  label="Above 200 SMA"
                  checked={filters.aboveSMA200}
                  onChange={(checked) => setFilters({
                    ...filters,
                    aboveSMA200: checked
                  })}
                />
              </div>
            </div>

            {/* Risk Filters */}
            <div>
              <Label>Risk Management</Label>
              <Checkbox
                label="Exclude existing positions"
                checked={filters.excludeExisting}
                onChange={(checked) => setFilters({
                  ...filters,
                  excludeExisting: checked
                })}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => refetch()}>
              Run Screener
            </Button>
            <Button variant="outline" onClick={saveCurrentFilters}>
              Save Preset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <h3 className="font-bold">
            Results ({results?.length || 0} matches)
          </h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">ATR</th>
                  <th className="text-right p-2">Volume</th>
                  <th className="text-right p-2">52W %</th>
                  <th className="text-right p-2">Position Size</th>
                  <th className="text-right p-2">R:R</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {results?.map(stock => (
                  <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono">{stock.symbol}</td>
                    <td className="text-right p-2">${stock.price.toFixed(2)}</td>
                    <td className="text-right p-2">${stock.atr_20d.toFixed(2)}</td>
                    <td className="text-right p-2">
                      {(stock.volume_avg_20d / 1000000).toFixed(1)}M
                    </td>
                    <td className="text-right p-2">
                      {stock.percent_from_high_52w.toFixed(1)}%
                    </td>
                    <td className="text-right p-2">
                      {stock.positionSize}
                    </td>
                    <td className="text-right p-2">
                      1:{stock.riskRewardRatio.toFixed(1)}
                    </td>
                    <td className="p-2">
                      <Button
                        size="sm"
                        onClick={() => openTradeEntry(stock)}
                      >
                        Trade
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

## Dashboard Components

### Risk Monitor

Real-time risk tracking with visual indicators.

```typescript
// src/components/dashboard/RiskMonitor.tsx
const RiskMonitor: React.FC = () => {
  const { data } = api.trade.getDashboard.useQuery();

  const getRiskColor = (percent: number, max: number) => {
    const ratio = percent / max;
    if (ratio < 0.5) return 'green';
    if (ratio < 0.8) return 'yellow';
    return 'red';
  };

  // Group positions by symbol for multiple position tracking
  const positionsBySymbol = data?.activePositions.reduce((acc, pos) => {
    if (!acc[pos.symbol]) acc[pos.symbol] = [];
    acc[pos.symbol].push(pos);
    return acc;
  }, {} as Record<string, Position[]>);

  return (
    <Card>
      <CardHeader>Risk Monitor</CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RiskMeter
            label="Portfolio Heat"
            current={data?.totalRiskPercent}
            max={6}
            color={getRiskColor(data?.totalRiskPercent, 6)}
          />
          <RiskMeter
            label="Daily Risk Used"
            current={data?.dailyRiskUsed}
            max={3}
            color={getRiskColor(data?.dailyRiskUsed, 3)}
          />

          {/* Show symbols with multiple positions */}
          {Object.entries(positionsBySymbol || {})
            .filter(([_, positions]) => positions.length > 1)
            .map(([symbol, positions]) => (
              <Alert key={symbol}>
                <AlertDescription>
                  {symbol}: {positions.length} positions
                  ({positions.map(p => p.timeframe).join(', ')})
                </AlertDescription>
              </Alert>
            ))
          }

          <CorrelationWarning positions={data?.activePositions} />
        </div>
      </CardContent>
    </Card>
  );
};
```

## Documentation Pages

### Documentation Layout

```typescript
// src/app/(marketing)/docs/page.tsx
const DocsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        <DocsSidebar />
        <main className="lg:col-span-3">
          <DocsContent />
        </main>
      </div>
    </div>
  );
};
```

### Blog Page

```typescript
// src/app/(marketing)/blog/page.tsx
const BlogPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">
        Trading Insights & Tutorials
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
```

## Implementation Guidelines

### Component File Organization
```
src/components/
├── marketing/           # Landing page components
├── subscription/        # Pricing and billing components
├── positions/          # Trading position components
├── screener/           # Stock screening components
├── dashboard/          # Risk and portfolio monitoring
└── ui/                 # Shared/reusable components
```

### Data Integration Patterns
- **API Calls**: Use tRPC mutations for all server interactions
- **Real-time Updates**: WebSocket connections for live market data
- **State Management**: Zustand stores for component state
- **Error Handling**: Toast notifications with fallback UI states
- **Loading States**: Skeleton components during data fetching

### Performance Considerations
- **Code Splitting**: Lazy load heavy trading components
- **Virtualization**: For large screener result tables
- **Memoization**: React.memo for expensive chart calculations
- **Debouncing**: User input in filters and search fields

---

*See also:*
- [Design System](../DESIGN_SYSTEM.md) - Complete design guidelines and shared components
- [Architecture](./ARCHITECTURE.md) - Component architecture patterns
- [API Specification](./API_SPECIFICATION.md) - Data interfaces for components