"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Card, Alert, Panel } from "@/components/ui/Panel";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Textarea, Select, Checkbox, Radio } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { tableStyles, filterStyles, tabStyles, getFilterButton, getTableCell } from "@/lib/tableStyles";
import { ChevronDown, Check } from "lucide-react";
import { Icon, Icons } from "@/lib/icons";
import { Tabs } from "@/components/ui/Tabs";

export default function ThemePage() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeFilter, setActiveFilter] = useState("active");
  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(["strategy1", "strategy2"]);
  const [activeModernTab, setActiveModernTab] = useState("active");
  const [activeClassicTab, setActiveClassicTab] = useState("overview");
  const [activePillTab, setActivePillTab] = useState("active");

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
                <div className="w-full h-20 bg-yellow-500 rounded-lg mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Warning</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">yellow-500</p>
              </div>
              
              <div>
                <div className="w-full h-20 bg-rose-500 rounded-lg mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Danger</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">rose-500</p>
              </div>
              
              <div>
                <div className="w-full h-20 bg-teal-500 rounded-lg mb-2"></div>
                <p className="text-sm dark:text-gray-400 text-gray-600">Success</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">teal-500</p>
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
                  <Button variant="success">Success Button</Button>
                  <Button variant="danger">Danger Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Sizes</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                  <Button variant="primary" fullWidth>Full Width</Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">States</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Normal</Button>
                  <Button variant="primary" disabled>Disabled</Button>
                  <Button variant="primary" loading>Loading</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Alerts Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Alerts</h2>
            
            <div className="space-y-4">
              <Alert intent="info" title="Information">
                This is an informational alert message with helpful details.
              </Alert>
              
              <Alert intent="success" title="Success!">
                Your operation completed successfully. Everything is working as expected.
              </Alert>
              
              <Alert intent="warning" title="Warning">
                Please review this warning message. Some action may be required.
              </Alert>
              
              <Alert intent="error" title="Error">
                An error occurred while processing your request. Please try again.
              </Alert>
              
              <Alert intent="info" icon={false}>
                Alert without icon - just text content.
              </Alert>
            </div>
          </Card>

          {/* Panels Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Panels & Cards</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Panel variant="default" padding="lg" rounded="xl">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">Default Panel</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Standard panel with default styling. Used for most content containers.
                </p>
              </Panel>
              
              <Panel variant="subtle" padding="lg" rounded="xl">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">Subtle Panel</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Subtle background for secondary content areas.
                </p>
              </Panel>
              
              <Panel variant="solid" padding="lg" rounded="xl">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">Solid Panel</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Solid background with border for emphasis.
                </p>
              </Panel>
              
              <Panel variant="glass" padding="lg" rounded="xl">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">Glass Panel</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Glassmorphic effect with backdrop blur.
                </p>
              </Panel>
            </div>
            
            <div className="mt-4">
              <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Interactive Panels</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Panel variant="default" padding="md" rounded="lg" hoverable>
                  <p className="text-sm dark:text-gray-300 text-gray-700">Hoverable Panel - changes on hover</p>
                </Panel>
                
                <Panel variant="default" padding="md" rounded="lg" clickable onClick={() => alert('Panel clicked!')}>
                  <p className="text-sm dark:text-gray-300 text-gray-700">Clickable Panel - click to test</p>
                </Panel>
              </div>
            </div>
          </Card>

          {/* Modal Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Modals</h2>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Open Standard Modal
              </Button>
              
              <Button variant="danger" onClick={() => {
                const modal = document.createElement('div');
                modal.id = 'confirm-modal-root';
                document.body.appendChild(modal);
                const root = require('react-dom/client').createRoot(modal);
                root.render(
                  <ConfirmModal
                    isOpen={true}
                    onClose={() => {
                      root.unmount();
                      document.body.removeChild(modal);
                    }}
                    onConfirm={() => {
                      alert('Confirmed!');
                      root.unmount();
                      document.body.removeChild(modal);
                    }}
                    title="Delete Item?"
                    message="Are you sure you want to delete this item? This action cannot be undone."
                    variant="danger"
                  />
                );
              }}>
                Open Confirm Modal
              </Button>
            </div>
            
            <Modal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title="Example Modal"
              description="This is a standard modal with header and footer"
              footer={
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setShowModal(false)}>
                    Save Changes
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                <p className="dark:text-gray-300 text-gray-700">
                  This is the modal content area. You can put any content here including forms, text, images, etc.
                </p>
                <FormField label="Example Field" helper="This is a helper text">
                  <Input placeholder="Enter value..." />
                </FormField>
              </div>
            </Modal>
          </Card>

          {/* Form Elements Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Form Elements</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Input Fields with FormField Component</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Text Input" helper="Enter any text value" required>
                    <Input
                      type="text"
                      placeholder="Enter text..."
                    />
                  </FormField>
                  
                  <FormField label="Disabled Input">
                    <Input
                      type="text"
                      disabled
                      value="Disabled field"
                    />
                  </FormField>
                  
                  <FormField label="Select Dropdown" helper="Choose an option">
                    <Select>
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </Select>
                  </FormField>
                  
                  <FormField label="Number Input">
                    <Input
                      type="number"
                      placeholder="0.00"
                    />
                  </FormField>
                  
                  <FormField label="With Error" error="This field has an error">
                    <Input
                      type="text"
                      placeholder="Error state"
                      error
                    />
                  </FormField>
                  
                  <FormField label="Password" helper="Must be at least 8 characters">
                    <Input
                      type="password"
                      placeholder="••••••••"
                    />
                  </FormField>
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
                    <input type="checkbox" className="mr-2 w-4 h-4 dark:bg-slate-700 bg-white dark:border-gray-600 border-gray-300 rounded dark:checked:bg-indigo-600 checked:bg-indigo-600 accent-indigo-600" defaultChecked />
                    <span className="dark:text-gray-300 text-gray-700">Checkbox option</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="radio" name="radio-group" className="mr-2 w-4 h-4 dark:bg-slate-700 bg-white dark:border-gray-600 border-gray-300 dark:checked:bg-indigo-600 checked:bg-indigo-600 accent-indigo-600" defaultChecked />
                    <span className="dark:text-gray-300 text-gray-700">Radio option 1</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input type="radio" name="radio-group" className="mr-2 w-4 h-4 dark:bg-slate-700 bg-white dark:border-gray-600 border-gray-300 dark:checked:bg-indigo-600 checked:bg-indigo-600 accent-indigo-600" />
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

          {/* Tabs Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Tabs</h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Default Tabs</p>
                <div className="border-b dark:border-slate-700 border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button className="py-2 px-1 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600 dark:text-indigo-400">
                      Active Tab
                    </button>
                    <button className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300">
                      Inactive Tab
                    </button>
                    <button className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300">
                      Another Tab
                    </button>
                  </nav>
                </div>
              </div>

              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Pill Tabs</p>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm font-medium rounded-full bg-indigo-600 text-white">
                    Active
                  </button>
                  <button className="px-4 py-2 text-sm font-medium rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600">
                    Inactive
                  </button>
                  <button className="px-4 py-2 text-sm font-medium rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600">
                    Another
                  </button>
                </div>
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

          {/* Icons Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Icons</h2>
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
              Centralized icon system with consistent sizing. All icons are from lucide-react.
            </p>

            {/* Icon Sizes */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Preset Icon Sizes</h3>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={Icons.alert.info} size="xs" className="text-gray-600 dark:text-gray-400" />
                  <span className="text-xs dark:text-gray-500 text-gray-500">xs (1rem)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={Icons.alert.info} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <span className="text-xs dark:text-gray-500 text-gray-500">sm (1.25rem)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={Icons.alert.info} size="md" className="text-gray-600 dark:text-gray-400" />
                  <span className="text-xs dark:text-gray-500 text-gray-500">md (1.75rem)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={Icons.alert.info} size="lg" className="text-gray-600 dark:text-gray-400" />
                  <span className="text-xs dark:text-gray-500 text-gray-500">lg (2.25rem)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={Icons.alert.info} size="xl" className="text-gray-600 dark:text-gray-400" />
                  <span className="text-xs dark:text-gray-500 text-gray-500">xl (3rem)</span>
                </div>
              </div>
            </div>

            {/* Custom Icon Sizes */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Custom Icon Sizes</h3>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={Icons.trading.trendingUp} size={12} className="text-success" />
                  <span className="text-xs dark:text-gray-500 text-gray-500">12px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={Icons.trading.trendingUp} size={18} className="text-success" />
                  <span className="text-xs dark:text-gray-500 text-gray-500">18px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={Icons.trading.trendingUp} size={32} className="text-success" />
                  <span className="text-xs dark:text-gray-500 text-gray-500">32px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon icon={Icons.trading.trendingUp} size={40} className="text-success" />
                  <span className="text-xs dark:text-gray-500 text-gray-500">40px</span>
                </div>
              </div>
            </div>

            {/* Common Icons by Category */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Alert Icons</h3>
                <div className="flex items-center gap-4">
                  <Icon icon={Icons.alert.info} size="sm" className="text-blue-600 dark:text-blue-400" />
                  <Icon icon={Icons.alert.warning} size="sm" className="text-warning" />
                  <Icon icon={Icons.alert.error} size="sm" className="text-danger" />
                  <Icon icon={Icons.alert.success} size="sm" className="text-success" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Navigation Icons</h3>
                <div className="flex items-center gap-4">
                  <Icon icon={Icons.navigation.gauge} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <Icon icon={Icons.navigation.arrowUpWideNarrow} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <Icon icon={Icons.navigation.mapPin} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <Icon icon={Icons.navigation.atom} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <Icon icon={Icons.navigation.arrowRightLeft} size="sm" className="text-gray-600 dark:text-gray-400" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Trading Icons</h3>
                <div className="flex items-center gap-4">
                  <Icon icon={Icons.trading.trendingUp} size="sm" className="text-success" />
                  <Icon icon={Icons.trading.trendingDown} size="sm" className="text-danger" />
                  <Icon icon={Icons.trading.dollarSign} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <Icon icon={Icons.trading.creditCard} size="sm" className="text-gray-600 dark:text-gray-400" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Action Icons</h3>
                <div className="flex items-center gap-4">
                  <Icon icon={Icons.action.plus} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <Icon icon={Icons.action.edit} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <Icon icon={Icons.action.trash} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <Icon icon={Icons.action.download} size="sm" className="text-gray-600 dark:text-gray-400" />
                  <Icon icon={Icons.action.save} size="sm" className="text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-gray-100 dark:bg-slate-800 rounded">
              <div className="text-xs dark:text-gray-400 text-gray-600 space-y-2">
                <p>
                  <strong>Import:</strong> <code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded">import {"{ Icon, Icons }"} from "@/lib/icons"</code>
                </p>
                <p>
                  <strong>Preset sizes:</strong> <code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded">size="xs" | "sm" | "md" | "lg" | "xl"</code>
                </p>
                <p>
                  <strong>Custom size:</strong> <code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded">size={"{"}24{"}"}</code> (in pixels)
                </p>
              </div>
            </div>
          </Card>

          {/* Tables Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Tables</h2>

            {/* Filter Pills Example (from positions page) - The icecream toggle buttons */}
            <div className="mb-6">
              <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Filter Pills (Toggle Button Group)</p>
              <div className="flex items-center gap-4">
                {/* Filter buttons */}
                <div className={filterStyles.container}>
                  <button
                    className={getFilterButton(activeFilter === "active")}
                    onClick={() => setActiveFilter("active")}
                  >
                    Active
                  </button>
                  <button
                    className={getFilterButton(activeFilter === "pending")}
                    onClick={() => setActiveFilter("pending")}
                  >
                    Pending
                  </button>
                  <button
                    className={getFilterButton(activeFilter === "closed")}
                    onClick={() => setActiveFilter("closed")}
                  >
                    Closed
                  </button>
                </div>

                {/* Strategy Dropdown with Checkboxes */}
                <div className={filterStyles.dropdown}>
                  <button
                    className={filterStyles.dropdownTrigger}
                    onClick={() => setShowStrategyDropdown(!showStrategyDropdown)}
                  >
                    <span>Strategies ({selectedStrategies.length})</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showStrategyDropdown && "rotate-180")} />
                  </button>

                  {showStrategyDropdown && (
                    <div className={filterStyles.dropdownMenu}>
                      <div className="p-2">
                        <label className={filterStyles.dropdownItem}>
                          <input
                            type="checkbox"
                            className={filterStyles.checkbox}
                            checked={selectedStrategies.length === 3}
                            onChange={() => {
                              if (selectedStrategies.length === 3) {
                                setSelectedStrategies([]);
                              } else {
                                setSelectedStrategies(["strategy1", "strategy2", "strategy3"]);
                              }
                            }}
                          />
                          <span className="text-sm">All Strategies</span>
                        </label>
                        <div className="border-t dark:border-slate-700 border-gray-200 my-2" />
                        {["Strategy Alpha", "Strategy Beta", "Strategy Gamma"].map((strategy, index) => (
                          <label key={strategy} className={filterStyles.dropdownItem}>
                            <input
                              type="checkbox"
                              className={filterStyles.checkbox}
                              checked={selectedStrategies.includes(`strategy${index + 1}`)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStrategies([...selectedStrategies, `strategy${index + 1}`]);
                                } else {
                                  setSelectedStrategies(selectedStrategies.filter(s => s !== `strategy${index + 1}`));
                                }
                              }}
                            />
                            <span className="text-sm">{strategy}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Improved Table Example - Using Centralized Styles */}
            <div className={tableStyles.wrapper}>
              <div className="overflow-x-auto">
                <table className={tableStyles.table}>
                  <thead className={tableStyles.thead}>
                    <tr className={tableStyles.headerRow}>
                      <th className={tableStyles.th}>Symbol</th>
                      <th className={tableStyles.th}>Price</th>
                      <th className={tableStyles.th}>Change</th>
                      <th className={tableStyles.th}>Volume</th>
                    </tr>
                  </thead>
                  <tbody className={tableStyles.tbody}>
                    <tr className={tableStyles.tr}>
                      <td className={tableStyles.tdBold}>BTC/USD</td>
                      <td className={tableStyles.tdBold}>$45,234.56</td>
                      <td className={tableStyles.tdSuccess}>+2.34%</td>
                      <td className={tableStyles.tdMuted}>$2.4B</td>
                    </tr>
                    <tr className={tableStyles.tr}>
                      <td className={tableStyles.tdBold}>ETH/USD</td>
                      <td className={tableStyles.tdBold}>$3,123.45</td>
                      <td className={tableStyles.tdDanger}>-1.23%</td>
                      <td className={tableStyles.tdMuted}>$1.2B</td>
                    </tr>
                    <tr className={tableStyles.tr}>
                      <td className={tableStyles.tdBold}>SOL/USD</td>
                      <td className={tableStyles.tdBold}>$98.76</td>
                      <td className={tableStyles.tdSuccess}>+5.67%</td>
                      <td className={tableStyles.tdMuted}>$892M</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Badges & Tags Section */}
          <Card>
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Badges & Tags</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-2">Small Pills</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-2 py-1 text-xs bg-indigo-500 text-white rounded-full">Primary</span>
                  <span className="px-2 py-1 text-xs bg-success text-white rounded-full">Success</span>
                  <span className="px-2 py-1 text-xs bg-warning text-white rounded-full">Warning</span>
                  <span className="px-2 py-1 text-xs bg-danger text-white rounded-full">Danger</span>
                  <span className="px-2 py-1 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full">Black/White</span>
                  <span className="px-2 py-1 text-xs dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700 rounded-full">Neutral</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-2">Medium Pills</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-full">Primary</span>
                  <span className="px-3 py-1.5 text-sm bg-success text-white rounded-full">Success</span>
                  <span className="px-3 py-1.5 text-sm bg-warning text-white rounded-full">Warning</span>
                  <span className="px-3 py-1.5 text-sm bg-danger text-white rounded-full">Danger</span>
                  <span className="px-3 py-1.5 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full">Black/White</span>
                  <span className="px-3 py-1.5 text-sm dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700 rounded-full">Neutral</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm dark:text-gray-500 text-gray-500 mb-2">Outline Badges</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 text-sm border dark:border-slate-700 border-gray-300 dark:text-gray-300 text-gray-700 rounded-lg">Outline Badge</span>
                </div>
              </div>
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
            <div className="fixed bottom-4 right-4 bg-success text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-slide-in">
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