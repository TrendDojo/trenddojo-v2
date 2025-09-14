"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  return (
    <AppLayout>
      <PageContent>
          {/* Account Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-4">Account</h2>
            <div className="dark:bg-slate-800/50 bg-white rounded-lg border dark:border-slate-700 border-gray-200 p-6">
            
              {/* Nickname */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200">
              <div>
                <h3 className="font-medium dark:text-white text-gray-900">Nickname</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                  Set up an avatar and nickname, it is suggested not to use your real name or the name of your social account as a nickname.
                </p>
              </div>
              <button className="text-indigo-500 hover:text-indigo-600 font-medium">Edit</button>
            </div>

              {/* Trading Profile */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200 last:border-0">
              <div className="flex-1">
                <h3 className="font-medium dark:text-white text-gray-900">Trading Profile</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                  Edit your trading profile, manage your risk settings and position sizing rules.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="dark:text-gray-300 text-gray-700">User-1a908</span>
                <button className="text-indigo-500 hover:text-indigo-600 font-medium">Edit</button>
              </div>
            </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-4">Notifications</h2>
            <div className="dark:bg-slate-800/50 bg-white rounded-lg border dark:border-slate-700 border-gray-200 p-6">
            
              {/* Notification Language */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium dark:text-white text-gray-900">Notification Language</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                  This will affect the language in which you receive notifications.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="dark:text-gray-300 text-gray-700">{selectedLanguage}</span>
                <button 
                  onClick={() => setShowLanguageModal(true)}
                  className="text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  Edit
                </button>
              </div>
            </div>

              {/* Notification Preferences */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium dark:text-white text-gray-900">Notification Preferences</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                  Once configured, you will receive notifications via email, app and website.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm dark:text-gray-300 text-gray-700">
                  Activities, Trade Notification, System Messages
                </span>
                <button className="text-indigo-500 hover:text-indigo-600 font-medium">Manage</button>
              </div>
            </div>

              {/* Auto Price Alert */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200 last:border-0">
              <div className="flex-1">
                <h3 className="font-medium dark:text-white text-gray-900">Auto Price Alert</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                  Once configured, you will receive auto price alerts for your holding positions.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="dark:text-gray-300 text-gray-700">Notification On, Sound On</span>
                <button className="text-indigo-500 hover:text-indigo-600 font-medium">Manage</button>
              </div>
            </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-4">Preferences</h2>
            <div className="dark:bg-slate-800/50 bg-white rounded-lg border dark:border-slate-700 border-gray-200 p-6">
            
              {/* Color Preference */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200">
              <div>
                <h3 className="font-medium dark:text-white text-gray-900">Color Preference</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="text-teal-500">↑</span>
                  <span className="dark:text-gray-300 text-gray-700">Green Up / Red Down</span>
                </span>
                <button className="text-indigo-500 hover:text-indigo-600 font-medium">Edit</button>
              </div>
            </div>

              {/* Style Settings */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200">
              <div>
                <h3 className="font-medium dark:text-white text-gray-900">Style Settings</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-teal-500 rounded-sm"></span>
                  <span className="w-4 h-4 bg-purple-500 rounded-sm"></span>
                  <span className="dark:text-gray-300 text-gray-700">Fresh</span>
                </div>
                <button className="text-indigo-500 hover:text-indigo-600 font-medium">Edit</button>
              </div>
            </div>

              {/* UTC Time Zone */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200">
              <div>
                <h3 className="font-medium dark:text-white text-gray-900">UTC Time Zone</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="dark:text-gray-300 text-gray-700">Last 24 hours</span>
                <button className="text-indigo-500 hover:text-indigo-600 font-medium">Edit</button>
              </div>
            </div>

              {/* Shortcuts */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200">
              <div>
                <h3 className="font-medium dark:text-white text-gray-900">Shortcuts</h3>
              </div>
              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
                <button className="text-indigo-500 hover:text-indigo-600 font-medium">Edit</button>
              </div>
            </div>

              {/* Theme */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200 last:border-0">
              <div>
                <h3 className="font-medium dark:text-white text-gray-900">Theme</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "px-3 py-1 rounded",
                      theme === 'light' 
                        ? "bg-indigo-500 text-white" 
                        : "dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700"
                    )}
                  >
                    Light
                  </button>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "px-3 py-1 rounded",
                      theme === 'dark' 
                        ? "bg-indigo-500 text-white" 
                        : "dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700"
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </button>
                </div>
                <button className="text-indigo-500 hover:text-indigo-600 font-medium">Edit</button>
              </div>
            </div>
            </div>
          </div>

          {/* Trading Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-4">Trading</h2>
            <div className="dark:bg-slate-800/50 bg-white rounded-lg border dark:border-slate-700 border-gray-200 p-6">
            
              {/* Position Limits */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200">
              <div className="flex-1">
                <h3 className="font-medium dark:text-white text-gray-900">Position Limits</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                  Configure maximum position sizes and risk limits for your trading account.
                </p>
              </div>
              <button className="text-indigo-500 hover:text-indigo-600 font-medium">Manage</button>
            </div>

              {/* API Management */}
              <div className="flex items-center justify-between py-4 border-b dark:border-slate-700/50 border-gray-200 last:border-0">
              <div className="flex-1">
                <h3 className="font-medium dark:text-white text-gray-900">API Management</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">
                  Manage your API keys for automated trading and data access.
                </p>
              </div>
              <button className="text-indigo-500 hover:text-indigo-600 font-medium">Manage</button>
            </div>
            </div>
          </div>

        {/* Language Selection Modal */}
        {showLanguageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="dark:bg-slate-800 bg-white rounded-lg p-6 w-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                  Notification Language
                </h3>
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="dark:text-gray-400 text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2">
                {["English", "Русский", "简体中文", "Español(Internacional)", "Türkçe", "Français", "Português"].map(lang => (
                  <label key={lang} className="flex items-center p-3 rounded hover:bg-slate-700/50 cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      value={lang}
                      checked={selectedLanguage === lang}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="mr-3"
                    />
                    <span className="dark:text-gray-300 text-gray-700">{lang}</span>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="flex-1 px-4 py-2 dark:bg-slate-700 bg-gray-200 dark:text-white text-gray-900 rounded hover:opacity-80"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContent>
    </AppLayout>
  );
}