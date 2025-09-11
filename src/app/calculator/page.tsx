"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PositionCalculatorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form inputs
  const [accountBalance, setAccountBalance] = useState<string>("10000");
  const [riskPercent, setRiskPercent] = useState<string>("2");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [targetPrice, setTargetPrice] = useState<string>("");

  // Calculated values
  const [riskAmount, setRiskAmount] = useState<number>(0);
  const [positionSize, setPositionSize] = useState<number>(0);
  const [positionValue, setPositionValue] = useState<number>(0);
  const [potentialProfit, setPotentialProfit] = useState<number>(0);
  const [riskRewardRatio, setRiskRewardRatio] = useState<number>(0);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  useEffect(() => {
    calculatePosition();
  }, [accountBalance, riskPercent, entryPrice, stopLoss, targetPrice]);

  const calculatePosition = () => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const stop = parseFloat(stopLoss) || 0;
    const target = parseFloat(targetPrice) || 0;

    if (balance && risk && entry && stop && entry !== stop) {
      // Calculate risk amount in dollars
      const dollarRisk = (balance * risk) / 100;
      setRiskAmount(dollarRisk);

      // Calculate position size (shares/units)
      const priceRisk = Math.abs(entry - stop);
      const shares = dollarRisk / priceRisk;
      setPositionSize(shares);

      // Calculate position value
      const value = shares * entry;
      setPositionValue(value);

      // Calculate potential profit and R:R ratio if target is set
      if (target && target !== entry) {
        const profit = shares * Math.abs(target - entry) * (target > entry ? 1 : -1);
        setPotentialProfit(profit);

        const reward = Math.abs(target - entry);
        const rrRatio = reward / priceRisk;
        setRiskRewardRatio(rrRatio);
      } else {
        setPotentialProfit(0);
        setRiskRewardRatio(0);
      }
    } else {
      // Reset all calculated values
      setRiskAmount(0);
      setPositionSize(0);
      setPositionValue(0);
      setPotentialProfit(0);
      setRiskRewardRatio(0);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">Position Calculator</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Trade Parameters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Account Balance ($)
                </label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2"
                  step="0.5"
                  min="0.1"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Entry Price ($)
                </label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Stop Loss ($)
                </label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="95.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Target Price ($) <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="110.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Position Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-gray-400">Risk Amount</span>
                <span className="text-white font-medium">
                  ${riskAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-gray-400">Position Size</span>
                <span className="text-white font-medium">
                  {positionSize.toFixed(2)} shares
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-gray-400">Position Value</span>
                <span className="text-white font-medium">
                  ${positionValue.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-gray-400">% of Account</span>
                <span className="text-white font-medium">
                  {accountBalance ? ((positionValue / parseFloat(accountBalance)) * 100).toFixed(1) : 0}%
                </span>
              </div>

              {targetPrice && (
                <>
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-gray-400">Potential Profit</span>
                    <span className={`font-medium ${potentialProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${potentialProfit.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-gray-400">Risk:Reward Ratio</span>
                    <span className={`font-medium ${riskRewardRatio >= 2 ? 'text-green-400' : riskRewardRatio >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                      1:{riskRewardRatio.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Risk Warning */}
            {positionValue > parseFloat(accountBalance) && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">
                  ⚠️ Position size exceeds account balance. Consider reducing risk or using margin carefully.
                </p>
              </div>
            )}

            {riskRewardRatio > 0 && riskRewardRatio < 1 && (
              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Risk:Reward ratio is less than 1:1. Consider adjusting your targets.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Educational Note */}
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">Position Sizing Formula</h3>
          <p className="text-gray-400 text-sm mb-3">
            This calculator uses the fixed risk position sizing method:
          </p>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-gray-300">
            Position Size = Risk Amount / (Entry Price - Stop Loss)
          </div>
          <p className="text-gray-400 text-sm mt-3">
            This ensures you only risk the specified percentage of your account on each trade, 
            regardless of the stock price or stop loss distance.
          </p>
        </div>
      </main>
    </div>
  );
}