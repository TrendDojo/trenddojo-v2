"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { StrategiesTab } from "@/components/strategies/StrategiesTab";
import { RulesTab } from "@/components/strategies/RulesTab";

export default function StrategiesPage() {
  const [activeTab, setActiveTab] = useState<"strategies" | "rules">("strategies");

  return (
    <AppLayout>
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
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Strategies
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "rules"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Rules
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "strategies" ? <StrategiesTab /> : <RulesTab />}
        </div>
      </PageContent>
    </AppLayout>
  );
}