"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";

export default function ThemePage() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <AppLayout title="Theme Showcase">
      <PageContent className="space-y-8">
          
          {/* Typography Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Typography</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-1">Heading 1</p>
                <h1 className="text-4xl font-bold dark:text-white text-gray-900">The quick brown fox jumps over the lazy dog</h1>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-1">Heading 2</p>
                <h2 className="text-3xl font-semibold dark:text-white text-gray-900">The quick brown fox jumps over the lazy dog</h2>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-1">Heading 3</p>
                <h3 className="text-2xl font-semibold dark:text-white text-gray-900">The quick brown fox jumps over the lazy dog</h3>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-1">Body Text</p>
                <p className="dark:text-gray-300 text-gray-700">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-1">Small Text</p>
                <p className="text-sm dark:text-gray-400 text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-1">Links</p>
                <div className="space-x-4">
                  <a href="#" className="text-indigo-500 hover:text-indigo-600 underline">Standard Link</a>
                  <a href="#" className="text-indigo-500 hover:text-indigo-600">Link without underline</a>
                </div>
              </div>
            </div>
          </Card>

          {/* Colors Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Colors</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <div className="w-full h-20 bg-indigo-600 rounded-lg mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Primary</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">indigo-600</p>
              </div>
              
              <div>
                <div className="w-full h-20 bg-teal-500 rounded-lg mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Positive/Up</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">teal-500</p>
              </div>
              
              <div>
                <div className="w-full h-20 bg-purple-600 rounded-lg mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Negative/Down</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">purple-600</p>
              </div>
              
              <div>
                <div className="w-full h-20 bg-amber-500 rounded-lg mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Warning</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">amber-500</p>
              </div>
              
              <div>
                <div className="w-full h-20 bg-rose-500 rounded-lg mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Danger</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">rose-500</p>
              </div>
              
              <div>
                <div className="w-full h-20 bg-emerald-500 rounded-lg mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Success</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">emerald-500</p>
              </div>
              
              <div>
                <div className="w-full h-20 dark:bg-slate-800 bg-gray-200 rounded-lg mb-2 border dark:border-slate-700 border-gray-300"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Neutral</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">slate-800/gray-200</p>
              </div>
              
              <div>
                <div className="w-full h-20 dark:bg-slate-900 bg-gray-50 rounded-lg mb-2 border dark:border-slate-700 border-gray-300"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Background</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">slate-900/gray-50</p>
              </div>
            </div>
          </Card>

          {/* Buttons Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Buttons</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Variants</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                    Success Button
                  </button>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    Danger Button
                  </button>
                  <button className="px-4 py-2 border dark:border-slate-700 border-gray-300 dark:text-gray-300 text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    Outline Button
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Sizes</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                    Small
                  </button>
                  <Button variant="primary">Medium</Button>
                  <button className="px-6 py-3 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                    Large
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">States</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Normal</Button>
                  <button className="px-4 py-2 bg-indigo-700 text-white rounded-lg">
                    Active/Pressed
                  </button>
                  <button disabled className="px-4 py-2 bg-gray-400 text-gray-200 rounded-lg cursor-not-allowed opacity-50">
                    Disabled
                  </button>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Form Elements Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Form Elements</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Input Fields</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                      Text Input
                    </label>
                    <input
                      type="text"
                      placeholder="Enter text..."
                      className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-gray-900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                      Disabled Input
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Disabled field"
                      className="w-full px-3 py-2 dark:bg-slate-900 bg-gray-100 border dark:border-slate-800 border-gray-200 rounded-lg dark:text-gray-500 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                      Select Dropdown
                    </label>
                    <select className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-gray-900">
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
                      Number Input
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-gray-900"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Textarea</p>
                <textarea
                  rows={4}
                  placeholder="Enter multiple lines of text..."
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-gray-900"
                />
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Checkboxes & Radio Buttons</p>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="dark:text-gray-300 text-gray-700">Checkbox option</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="radio" name="radio-group" className="mr-2" defaultChecked />
                    <span className="dark:text-gray-300 text-gray-700">Radio option 1</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="radio" name="radio-group" className="mr-2" />
                    <span className="dark:text-gray-300 text-gray-700">Radio option 2</span>
                  </label>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 dark:text-gray-300 text-gray-700">Toggle switch</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Cards & Panels Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Cards & Panels</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">Basic Card</h3>
                <p className="dark:text-gray-400 text-gray-600">This is a basic card component with padding and border.</p>
              </Card>
              
              <div className="dark:bg-slate-800/50 bg-white rounded-lg border dark:border-slate-700 border-gray-200 p-6">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">Semi-transparent Card</h3>
                <p className="dark:text-gray-400 text-gray-600">This card has a semi-transparent background.</p>
              </div>
              
              <div className="dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">Gradient Card</h3>
                <p className="dark:text-gray-400 text-gray-600">This card has a gradient background.</p>
              </div>
              
              <div className="dark:bg-slate-800 bg-white rounded-lg shadow-xl p-6">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">Shadow Card</h3>
                <p className="dark:text-gray-400 text-gray-600">This card has a strong shadow effect.</p>
              </div>
            </div>
          </Card>

          {/* Alerts & Messages Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Alerts & Messages</h2>
            
            <div className="space-y-4">
              <div className="bg-sky-500/10 text-sky-500 px-4 py-3 rounded-lg">
                <strong>Info:</strong> This is an informational message.
              </div>
              
              <div className="bg-emerald-500/10 text-emerald-500 px-4 py-3 rounded-lg">
                <strong>Success:</strong> Operation completed successfully!
              </div>
              
              <div className="bg-amber-500/10 text-amber-500 px-4 py-3 rounded-lg">
                <strong>Warning:</strong> Please review before proceeding.
              </div>
              
              <div className="bg-rose-500/10 text-rose-500 px-4 py-3 rounded-lg">
                <strong>Error:</strong> Something went wrong. Please try again.
              </div>
            </div>
          </Card>

          {/* Modal Example */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Modals & Overlays</h2>
            
            <div className="space-y-4">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Open Modal
              </Button>
              
              <Button variant="secondary" onClick={showToastMessage}>
                Show Toast
              </Button>
            </div>
          </Card>

          {/* Tables Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Tables</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-slate-700 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold dark:text-gray-300 text-gray-700">Symbol</th>
                    <th className="text-left py-3 px-4 font-semibold dark:text-gray-300 text-gray-700">Price</th>
                    <th className="text-left py-3 px-4 font-semibold dark:text-gray-300 text-gray-700">Change</th>
                    <th className="text-left py-3 px-4 font-semibold dark:text-gray-300 text-gray-700">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-slate-800 border-gray-100">
                    <td className="py-3 px-4 dark:text-white text-gray-900">BTC/USD</td>
                    <td className="py-3 px-4 dark:text-white text-gray-900">$45,234.56</td>
                    <td className="py-3 px-4 text-teal-500">+2.34%</td>
                    <td className="py-3 px-4 dark:text-gray-400 text-gray-600">$2.4B</td>
                  </tr>
                  <tr className="border-b dark:border-slate-800 border-gray-100">
                    <td className="py-3 px-4 dark:text-white text-gray-900">ETH/USD</td>
                    <td className="py-3 px-4 dark:text-white text-gray-900">$3,123.45</td>
                    <td className="py-3 px-4 text-purple-500">-1.23%</td>
                    <td className="py-3 px-4 dark:text-gray-400 text-gray-600">$1.2B</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Badges & Tags Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Badges & Tags</h2>
            
            <div className="flex flex-wrap gap-3">
              <span className="px-2 py-1 text-xs bg-indigo-500 text-white rounded-full">Primary</span>
              <span className="px-2 py-1 text-xs bg-teal-500 text-white rounded-full">Positive</span>
              <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full">Negative</span>
              <span className="px-2 py-1 text-xs bg-emerald-500 text-white rounded-full">Success</span>
              <span className="px-2 py-1 text-xs bg-amber-500 text-white rounded-full">Warning</span>
              <span className="px-2 py-1 text-xs bg-rose-500 text-white rounded-full">Danger</span>
              <span className="px-2 py-1 text-xs dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700 rounded-full">Neutral</span>
              <span className="px-3 py-1.5 text-sm border dark:border-slate-700 border-gray-300 dark:text-gray-300 text-gray-700 rounded-lg">Outline Badge</span>
            </div>
          </Card>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="dark:bg-slate-800 bg-white rounded-lg p-6 w-96 max-w-[90%]">
                <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                  Modal Title
                </h3>
                <p className="dark:text-gray-400 text-gray-600 mb-6">
                  This is a modal dialog. It can contain any content and is displayed above the main content with a dark overlay.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setShowModal(false)} fullWidth>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setShowModal(false)} fullWidth>
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Toast */}
          {showToast && (
            <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-slide-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Success! Action completed.</span>
              </div>
            </div>
          )}
      </PageContent>
    </AppLayout>
  );
}