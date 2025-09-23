# BrokerDataRefresh Testing Strategy

## 🎯 Testing Philosophy

This test suite follows a **behavior-driven approach** focusing on real-world usage patterns rather than implementation details. The tests are designed to be:

1. **Readable** - Test names describe actual behaviors
2. **Maintainable** - Tests are organized by functionality
3. **Extensible** - Easy to add new test cases
4. **Reliable** - No flaky tests, proper async handling

## 📊 Test Coverage Matrix

### Core Functionality ✅
- [x] Data fetching on mount
- [x] Data transformation from API
- [x] Success state handling
- [x] Loading state transitions

### Error Handling 🛡️
- [x] Network errors
- [x] API error responses
- [x] Retry logic with exponential backoff
- [x] Max retry limits

### Trigger Behaviors 🎬
- [x] **Mount**: Initial fetch
- [x] **Focus**: Stale data refresh
- [x] **Interval**: Periodic polling
- [x] **Manual**: User-initiated refresh

### Edge Cases 🔧
- [x] Empty data responses
- [x] Malformed API responses
- [x] Concurrent fetch prevention
- [x] Memory leak prevention (cleanup)
- [x] Staleness detection

## 🏗️ Test Structure

```
describe('useBrokerDataRefresh Hook')
  ├── Core Functionality
  │   ├── fetch on mount
  │   ├── skip fetch without trigger
  │   └── transform API response
  │
  ├── Error Handling
  │   ├── network errors
  │   ├── retry mechanism
  │   └── non-ok responses
  │
  ├── Trigger Behaviors
  │   ├── Focus Trigger
  │   │   ├── refresh when stale
  │   │   └── skip when fresh
  │   ├── Interval Trigger
  │   └── Manual Trigger
  │
  ├── Concurrent Fetch Prevention
  │   ├── prevent simultaneous
  │   └── allow sequential
  │
  ├── Staleness Detection
  │
  ├── Callbacks
  │   ├── onSuccess
  │   └── onError
  │
  └── Edge Cases
      ├── empty connections
      ├── missing properties
      └── cleanup on unmount
```

## 🔄 Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode for development
npm run test:watch

# Run only broker tests
npm test -- useBrokerDataRefresh
```

## 🎨 Test Patterns Used

### 1. **Mock Management**
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // Setup default successful response
});
```

### 2. **Async Testing**
```typescript
await waitFor(() => {
  expect(result.current.status).toBe('success');
});
```

### 3. **Timer Control**
```typescript
vi.useFakeTimers();
await vi.advanceTimersByTimeAsync(1000);
vi.useRealTimers();
```

### 4. **Event Simulation**
```typescript
window.dispatchEvent(new Event('focus'));
```

## 🚀 Future Test Additions

When adding new features, add corresponding tests for:

### New Triggers
1. Add test case in "Trigger Behaviors" section
2. Test both activation and skip conditions
3. Test interaction with other triggers

### New Options
1. Add dedicated describe block
2. Test default value
3. Test custom value
4. Test edge cases

### New Data Fields
1. Update transformation tests
2. Update mock data
3. Test null/undefined handling

## 📝 Example: Adding a New Trigger

```typescript
describe('Navigation Trigger', () => {
  it('should refresh on route change', async () => {
    const { result } = renderHook(() =>
      useBrokerDataRefresh({
        triggers: ['navigation']
      })
    );

    // Simulate navigation
    await act(async () => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('should not refresh if disabled', async () => {
    renderHook(() =>
      useBrokerDataRefresh({
        triggers: []
      })
    );

    await act(async () => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
```

## 🐛 Debugging Failed Tests

1. **Check Mock Setup**: Ensure `mockFetch` is properly configured
2. **Check Timers**: Verify `vi.useFakeTimers()` is called
3. **Check Async**: Use `waitFor` for async state changes
4. **Check Cleanup**: Ensure `afterEach` cleans up properly

## 💡 Best Practices

1. **Test Behavior, Not Implementation**
   - ✅ "should refresh when data is stale"
   - ❌ "should call setState 3 times"

2. **Use Descriptive Names**
   - ✅ "should retry with exponential backoff on error"
   - ❌ "test retry"

3. **One Assertion Per Test**
   - Split complex scenarios into multiple tests
   - Makes failures easier to diagnose

4. **Mock External Dependencies**
   - Always mock `fetch`
   - Control time with fake timers
   - Mock console methods if needed

5. **Test Error Paths**
   - Network failures
   - Invalid data
   - Edge cases

## 🔍 Coverage Goals

- **Statements**: > 95%
- **Branches**: > 90%
- **Functions**: > 95%
- **Lines**: > 95%

Run `npm run test:coverage` to check current coverage.