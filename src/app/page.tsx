"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { api } from "@/lib/api";

export default function Home() {
  const { data: session, status } = useSession();
  
  // Example tRPC query
  const { data: userProfile, isLoading } = api.user.getProfile.useQuery(
    undefined, // no input
    { enabled: !!session?.user } // only run if user is logged in
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-8 text-6xl font-bold text-white">
            Trend<span className="text-blue-500">Dojo</span> v2
          </h1>
          <div className="mb-6 rounded-lg bg-green-900/50 border border-green-500 px-4 py-3">
            <p className="text-green-300">
              🚀 <strong>Deployment Test:</strong> Vercel connection ready for testing!
            </p>
          </div>
          <p className="mb-12 text-xl text-gray-300">
            The Stripe for Trading Strategies
          </p>

          {!session ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-400">
                Transform your brokerage account into an intelligent execution engine
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => signIn()}
                  className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg bg-gray-800 p-6">
                <h2 className="mb-4 text-2xl text-white">
                  Welcome back, {session.user?.name || session.user?.email}!
                </h2>
                
                {isLoading ? (
                  <div className="text-gray-400">Loading profile...</div>
                ) : userProfile ? (
                  <div className="space-y-2 text-left">
                    <p className="text-gray-300">
                      <span className="font-semibold">Subscription:</span> {userProfile.subscriptionTier}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Accounts:</span> {userProfile.accounts.length}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Broker Connections:</span> {userProfile.brokerConnections.length}
                    </p>
                  </div>
                ) : (
                  <div className="text-gray-400">Setting up your profile...</div>
                )}
              </div>
              
              <div className="space-x-4">
                <button
                  onClick={() => signOut()}
                  className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-gray-800 p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">Portfolio Management</h3>
              <p className="text-gray-400">
                Systematic position sizing, risk management, and trade execution
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">Broker Integration</h3>
              <p className="text-gray-400">
                Connect to Alpaca, Interactive Brokers, and other platforms
              </p>
            </div>
            <div className="rounded-lg bg-gray-800 p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">Risk Controls</h3>
              <p className="text-gray-400">
                Automated position limits, stop losses, and correlation management
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}