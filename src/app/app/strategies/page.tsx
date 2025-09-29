"use client";

import { useState } from "react";
import { PageContent } from "@/components/layout/PageContent";
import { StrategiesTab } from "@/components/strategies/StrategiesTab";
import { EntriesTab } from "@/components/strategies/EntriesTab";
import { ExitsTab } from "@/components/strategies/ExitsTab";

export default function StrategiesPage() {
  const [activeTab, setActiveTab] = useState<"strategies" | "entries" | "exits">("strategies");

  return (
    
      <PageContent>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
            Strategy Management
          </h1>
          <p className="text-sm dark:text-gray-400 text-gray-600">
            Create and manage your trading strategies
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b dark:border-slate-700 border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("strategies")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "strategies"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Strategies
            </button>
            <button
              onClick={() => setActiveTab("entries")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "entries"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Entry Rules
            </button>
            <button
              onClick={() => setActiveTab("exits")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "exits"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Exit Rules
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "strategies" && <StrategiesTab />}
          {activeTab === "entries" && <EntriesTab />}
          {activeTab === "exits" && <ExitsTab />}
        </div>
      </PageContent>
    
  );
}