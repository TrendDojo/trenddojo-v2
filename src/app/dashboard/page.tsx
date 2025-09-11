"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) router.push("/login"); // Not logged in
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">TrendDojo Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">{session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Welcome Back!</h2>
            <p className="text-gray-400 text-sm mb-4">
              You're logged in as: {session.user?.email}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subscription:</span>
                <span className="text-white">{session.user?.subscriptionTier || 'free'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Paper Trading:</span>
                <span className="text-green-400">Enabled</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Real Trading:</span>
                <span className={session.user?.realTradingEnabled ? "text-green-400" : "text-red-400"}>
                  {session.user?.realTradingEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Position Calculator Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Position Calculator</h2>
            <p className="text-gray-400 text-sm mb-4">
              Calculate optimal position sizes based on your risk tolerance
            </p>
            <button 
              onClick={() => router.push("/calculator")}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Open Calculator
            </button>
          </div>

          {/* Portfolio Overview Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Portfolio Overview</h2>
            <p className="text-gray-400 text-sm mb-4">
              Track your trading performance and risk metrics
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total P&L:</span>
                <span className="text-green-400">+$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Win Rate:</span>
                <span className="text-white">0%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Risk Used:</span>
                <span className="text-white">0%</span>
              </div>
            </div>
          </div>

          {/* Recent Trades Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Recent Trades</h2>
            <p className="text-gray-400 text-sm">
              No trades yet. Start with paper trading to test your strategies.
            </p>
          </div>

          {/* Risk Management Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2">Risk Management</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Max Risk/Trade:</span>
                <span className="text-white">2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Daily Risk Limit:</span>
                <span className="text-white">6%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Weekly Risk Limit:</span>
                <span className="text-white">10%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors text-left">
                📊 View Market Analysis
              </button>
              <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors text-left">
                ⚙️ Strategy Settings
              </button>
              <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors text-left">
                📈 Performance Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}