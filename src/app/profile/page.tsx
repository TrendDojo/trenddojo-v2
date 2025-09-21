"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { User, Mail, Phone, Globe, Shield, Bell, Smartphone, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock user data
const userData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  timezone: "America/New_York",
  language: "English",
  avatar: null,
  joinedDate: new Date("2023-06-15"),

  // Preferences
  emailNotifications: {
    tradeExecutions: true,
    dailySummary: false,
    weeklyReport: true,
    productUpdates: false,
    marketAlerts: true,
  },

  // Security
  twoFactorEnabled: false,
  lastPasswordChange: new Date("2023-12-01"),

  // Trading preferences
  defaultPortfolio: "Main Portfolio",
  defaultTimeframe: "1D",
  confirmTrades: true,
  showPnlInPercent: false,
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "security" | "trading">("general");
  const [formData, setFormData] = useState(userData);
  const [isSaving, setIsSaving] = useState(false);
  const [changesSaved, setChangesSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setChangesSaved(true);
    setTimeout(() => setChangesSaved(false), 3000);
  };

  return (
    <AppLayout>
      <PageContent>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-sm dark:text-gray-400 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* User Info Summary */}
        <div className="mb-8 p-6 border dark:border-slate-700 border-gray-200 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {formData.firstName[0]}{formData.lastName[0]}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold dark:text-white text-gray-900">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-sm dark:text-gray-400 text-gray-600">
                {formData.email}
              </p>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                Member since {userData.joinedDate.toLocaleDateString()}
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Change Avatar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b dark:border-slate-700 border-gray-200">
          <button
            onClick={() => setActiveTab("general")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "general"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "notifications"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "security"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("trading")}
            className={cn(
              "pb-3 px-1 font-medium transition-colors",
              activeTab === "trading"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Trading
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "general" && (
          <div className="max-w-2xl space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Singapore">Singapore (SGT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="max-w-2xl space-y-6">
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
              <Bell className="w-5 h-5 inline mr-2" />
              Email Notifications
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between py-3 px-4 border dark:border-slate-700 border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer">
                <div>
                  <p className="font-medium dark:text-white text-gray-900">Trade Executions</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">Get notified when trades are executed</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.tradeExecutions}
                  onChange={(e) => setFormData({
                    ...formData,
                    emailNotifications: {...formData.emailNotifications, tradeExecutions: e.target.checked}
                  })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between py-3 px-4 border dark:border-slate-700 border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer">
                <div>
                  <p className="font-medium dark:text-white text-gray-900">Daily Summary</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">Daily portfolio performance summary</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.dailySummary}
                  onChange={(e) => setFormData({
                    ...formData,
                    emailNotifications: {...formData.emailNotifications, dailySummary: e.target.checked}
                  })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between py-3 px-4 border dark:border-slate-700 border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer">
                <div>
                  <p className="font-medium dark:text-white text-gray-900">Weekly Report</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">Weekly trading performance report</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.weeklyReport}
                  onChange={(e) => setFormData({
                    ...formData,
                    emailNotifications: {...formData.emailNotifications, weeklyReport: e.target.checked}
                  })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between py-3 px-4 border dark:border-slate-700 border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer">
                <div>
                  <p className="font-medium dark:text-white text-gray-900">Market Alerts</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">Important market movement notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.marketAlerts}
                  onChange={(e) => setFormData({
                    ...formData,
                    emailNotifications: {...formData.emailNotifications, marketAlerts: e.target.checked}
                  })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between py-3 px-4 border dark:border-slate-700 border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer">
                <div>
                  <p className="font-medium dark:text-white text-gray-900">Product Updates</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">New features and updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.productUpdates}
                  onChange={(e) => setFormData({
                    ...formData,
                    emailNotifications: {...formData.emailNotifications, productUpdates: e.target.checked}
                  })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-2xl space-y-6">
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
              <Shield className="w-5 h-5 inline mr-2" />
              Security Settings
            </h3>

            <div className="space-y-6">
              <div className="p-4 border dark:border-slate-700 border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium dark:text-white text-gray-900">Password</p>
                    <p className="text-sm dark:text-gray-400 text-gray-600">
                      Last changed {userData.lastPasswordChange.toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="p-4 border dark:border-slate-700 border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium dark:text-white text-gray-900">
                      <Smartphone className="w-4 h-4 inline mr-2" />
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm dark:text-gray-400 text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {formData.twoFactorEnabled ? (
                      <>
                        <span className="text-sm text-success font-medium">Enabled</span>
                        <Button variant="secondary" size="sm">
                          Manage
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">Disabled</span>
                        <Button variant="primary" size="sm">
                          Enable
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 dark:bg-amber-950/20 bg-amber-50 border dark:border-amber-800 border-amber-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium dark:text-amber-400 text-amber-800">Security Recommendation</p>
                    <p className="text-sm dark:text-amber-400/80 text-amber-700 mt-1">
                      Enable two-factor authentication to protect your account from unauthorized access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-slate-700 border-gray-200">
                <h4 className="font-medium dark:text-white text-gray-900 mb-3">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium dark:text-white text-gray-900">
                        Current Session
                      </p>
                      <p className="text-sm dark:text-gray-400 text-gray-600">
                        Chrome on MacOS • New York, US
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-success/20 text-success">
                      ACTIVE
                    </span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="mt-3">
                  Sign Out All Other Sessions
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "trading" && (
          <div className="max-w-2xl space-y-6">
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
              Trading Preferences
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Default Portfolio
                </label>
                <select
                  value={formData.defaultPortfolio}
                  onChange={(e) => setFormData({...formData, defaultPortfolio: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                >
                  <option value="Main Portfolio">Main Portfolio</option>
                  <option value="Growth Portfolio">Growth Portfolio</option>
                  <option value="Income Portfolio">Income Portfolio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                  Default Chart Timeframe
                </label>
                <select
                  value={formData.defaultTimeframe}
                  onChange={(e) => setFormData({...formData, defaultTimeframe: e.target.value})}
                  className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1H">1 Hour</option>
                  <option value="4H">4 Hours</option>
                  <option value="1D">1 Day</option>
                  <option value="1W">1 Week</option>
                  <option value="1M">1 Month</option>
                </select>
              </div>

              <label className="flex items-center justify-between py-3 px-4 border dark:border-slate-700 border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer">
                <div>
                  <p className="font-medium dark:text-white text-gray-900">Trade Confirmation</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">Require confirmation before executing trades</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.confirmTrades}
                  onChange={(e) => setFormData({...formData, confirmTrades: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between py-3 px-4 border dark:border-slate-700 border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer">
                <div>
                  <p className="font-medium dark:text-white text-gray-900">Show P&L as Percentage</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">Display profit/loss as percentage instead of currency</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showPnlInPercent}
                  onChange={(e) => setFormData({...formData, showPnlInPercent: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </label>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
          >
            Save Changes
          </Button>
          <Button variant="secondary">
            Cancel
          </Button>
          {changesSaved && (
            <div className="flex items-center gap-2 text-success">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Changes saved successfully</span>
            </div>
          )}
        </div>
      </PageContent>
    </AppLayout>
  );
}