"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
// import { Icon, Icons } from "@/lib/icons"; // Removed - using Lucide icons directly
import { Check, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { tableStyles } from "@/lib/tableStyles";

// Mock subscription data
const currentSubscription = {
  tier: "basic",
  status: "active",
  price: 14.99,
  nextBillingDate: new Date("2024-02-15"),
  paymentMethod: {
    type: "card",
    last4: "4242",
    brand: "Visa",
  }
};

// Subscription tiers
const tiers = [
  {
    name: "Free",
    price: 0,
    features: [
      "1 Portfolio",
      "5 Active Positions",
      "Basic Screener",
      "Manual Trading Only",
      "Community Support",
    ],
    limitations: [
      "No Real-time Data",
      "No Broker Integration",
      "No API Access",
      "Limited Indicators",
    ]
  },
  {
    name: "Starter",
    price: 4.99,
    features: [
      "2 Portfolios",
      "10 Active Positions",
      "Advanced Screener",
      "Real-time Data",
      "Email Support",
      "Basic Indicators",
    ],
    limitations: [
      "No Broker Integration",
      "No API Access",
    ]
  },
  {
    name: "Basic",
    price: 14.99,
    current: true,
    features: [
      "5 Portfolios",
      "25 Active Positions",
      "Full Screener Access",
      "Real-time Data",
      "Broker Integration",
      "Priority Support",
      "All Indicators",
      "Trade Journal",
    ],
    limitations: [
      "No API Access",
    ]
  },
  {
    name: "Pro",
    price: 39.99,
    features: [
      "Unlimited Portfolios",
      "Unlimited Positions",
      "Full Screener Access",
      "Real-time Data",
      "Multiple Broker Integration",
      "API Access",
      "24/7 Support",
      "All Indicators",
      "Advanced Analytics",
      "Custom Alerts",
    ],
    limitations: []
  }
];

// Mock billing history
const billingHistory = [
  { date: new Date("2024-01-15"), amount: 14.99, status: "paid", invoice: "INV-2024-001" },
  { date: new Date("2023-12-15"), amount: 14.99, status: "paid", invoice: "INV-2023-012" },
  { date: new Date("2023-11-15"), amount: 14.99, status: "paid", invoice: "INV-2023-011" },
  { date: new Date("2023-10-15"), amount: 14.99, status: "paid", invoice: "INV-2023-010" },
  { date: new Date("2023-09-15"), amount: 14.99, status: "paid", invoice: "INV-2023-009" },
];

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState("plans");

  const tabItems = [
    { id: "plans", label: "Subscription Plans" },
    { id: "billing", label: "Billing History" }
  ];

  return (
    <AppLayout>
      <PageContent>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
            Subscription & Billing
          </h1>
          <p className="text-sm dark:text-gray-400 text-gray-600">
            Manage your subscription plan and billing information
          </p>
        </div>

        {/* Current Subscription Status */}
        <div className="mb-8 p-6 border dark:border-slate-700 border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold dark:text-white text-gray-900">
                  Current Plan: {currentSubscription.tier.charAt(0).toUpperCase() + currentSubscription.tier.slice(1)}
                </h2>
                <span className="px-2 py-1 rounded text-xs font-medium bg-success/20 text-success">
                  {currentSubscription.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm dark:text-gray-400 text-gray-600">
                ${currentSubscription.price}/month • Next billing: {currentSubscription.nextBillingDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm dark:text-gray-400 text-gray-600">Payment Method</p>
                <p className="text-sm font-medium dark:text-white text-gray-900">
                  {currentSubscription.paymentMethod.brand} •••• {currentSubscription.paymentMethod.last4}
                </p>
              </div>
              <Button variant="secondary" size="sm">
                Update Payment
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-6"
        />

        {/* Tab Content */}
        {activeTab === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "border rounded-xl p-6",
                  tier.current
                    ? "dark:border-indigo-500 border-indigo-500 dark:bg-indigo-950/20 bg-indigo-50/50"
                    : "dark:border-slate-700 border-gray-200"
                )}
              >
                {tier.current && (
                  <div className="mb-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-600 text-white">
                      CURRENT PLAN
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold dark:text-white text-gray-900">
                    ${tier.price}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-sm dark:text-gray-400 text-gray-600">/month</span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success mt-0.5" />
                      <span className="text-sm dark:text-gray-300 text-gray-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {tier.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-danger mt-0.5" />
                      <span className="text-sm dark:text-gray-500 text-gray-500">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>

                {!tier.current && (
                  <Button
                    variant={tier.price > currentSubscription.price ? "primary" : "secondary"}
                    size="sm"
                    fullWidth
                  >
                    {tier.price === 0 ? "Downgrade" : tier.price > currentSubscription.price ? "Upgrade" : "Switch Plan"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "billing" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                Billing History
              </h3>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
            <div className={tableStyles.wrapper}>
              <div className="overflow-x-auto">
                <table className={tableStyles.table}>
                <thead className={tableStyles.thead}>
                  <tr className={tableStyles.headerRow}>
                    <th className={tableStyles.th}>
                      Date
                    </th>
                    <th className={tableStyles.th}>
                      Invoice
                    </th>
                    <th className={tableStyles.thRight}>
                      Amount
                    </th>
                    <th className={tableStyles.thCenter}>
                      Status
                    </th>
                    <th className={tableStyles.thRight}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={tableStyles.tbody}>
                  {billingHistory.map((item, idx) => (
                    <tr key={idx} className={tableStyles.tr}>
                      <td className={tableStyles.td}>
                        {item.date.toLocaleDateString()}
                      </td>
                      <td className={tableStyles.td}>
                        {item.invoice}
                      </td>
                      <td className={tableStyles.tdRight}>
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className={tableStyles.tdCenter}>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          item.status === "paid"
                            ? "bg-success/20 text-success"
                            : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                        )}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={tableStyles.tdRight}>
                        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 p-4 dark:bg-slate-800/30 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold dark:text-white text-gray-900 mb-2">
                Need Help with Billing?
              </h4>
              <p className="text-sm dark:text-gray-400 text-gray-600 mb-3">
                Contact our support team for any billing questions or issues.
              </p>
              <Button variant="secondary" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </PageContent>
    </AppLayout>
  );
}