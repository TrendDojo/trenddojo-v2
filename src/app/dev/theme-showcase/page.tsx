"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContent } from "@/components/layout/PageContent";
import { Button } from "@/components/ui/Button";
import { Card, Alert, Panel } from "@/components/ui/Panel";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { FormField, Input, Textarea, Select, Checkbox, Radio } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { tableStyles, filterStyles, tabStyles, getFilterButton, getTableCell, getTableRow } from "@/lib/tableStyles";
import { buttonStyles } from "@/lib/buttonStyles";
import { panelStyles, alertStyles } from "@/lib/panelStyles";
import { checkboxStyles, radioStyles } from "@/lib/formStyles";
import { ChevronDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, Columns, Download as DownloadIcon, RefreshCw } from "lucide-react";
// Icon system - using Lucide icons directly with Tailwind sizing
import { Info, AlertTriangle, XCircle, CheckCircle, Gauge, ArrowUpWideNarrow, MapPin, Atom, ArrowRightLeft, TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, Edit, Trash, Download, Save } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";

// Table Components Section
function TablesSection() {
  const [activeFilter, setActiveFilter] = useState("active");
  const [showStrategyDropdown, setShowStrategyDropdown] = useState(false);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(["strategy1", "strategy2"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['symbol', 'price', 'change', 'volume', 'market_cap', 'actions']);

  const totalPages = 10;
  const allColumns = [
    { id: 'symbol', label: 'Symbol' },
    { id: 'price', label: 'Price' },
    { id: 'change', label: 'Change' },
    { id: 'volume', label: 'Volume' },
    { id: 'market_cap', label: 'Market Cap' },
    { id: 'actions', label: 'Actions' }
  ];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleRowSelection = (rowId: number) => {
    setSelectedRows(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  const toggleAllRows = () => {
    setSelectedRows(selectedRows.length === 3 ? [] : [1, 2, 3]);
  };

  return (
    <div className="space-y-8">
      {/* Basic Table */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Basic Table</h2>

        <div className={tableStyles.wrapper}>
          <div className="overflow-x-auto">
            <table className={tableStyles.table}>
              <thead className={tableStyles.thead}>
                <tr className={tableStyles.headerRow}>
                  <th className={tableStyles.th}>Symbol</th>
                  <th className={tableStyles.th}>Price</th>
                  <th className={tableStyles.th}>Change</th>
                  <th className={tableStyles.thRight}>Volume</th>
                </tr>
              </thead>
              <tbody className={tableStyles.tbody}>
                <tr className={getTableRow(0)}>
                  <td className={tableStyles.tdBold}>BTC/USD</td>
                  <td className={tableStyles.tdBold}>$45,234.56</td>
                  <td className={tableStyles.tdSuccess}>+2.34%</td>
                  <td className={tableStyles.tdRight}>$2.4B</td>
                </tr>
                <tr className={getTableRow(1)}>
                  <td className={tableStyles.tdBold}>ETH/USD</td>
                  <td className={tableStyles.tdBold}>$3,123.45</td>
                  <td className={tableStyles.tdDanger}>-1.23%</td>
                  <td className={tableStyles.tdRight}>$1.2B</td>
                </tr>
                <tr className={getTableRow(2)}>
                  <td className={tableStyles.tdBold}>SOL/USD</td>
                  <td className={tableStyles.tdBold}>$98.76</td>
                  <td className={tableStyles.tdSuccess}>+5.67%</td>
                  <td className={tableStyles.tdRight}>$892M</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Filter Pills */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Filter Pills & Dropdowns</h2>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Filter pills */}
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

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Action Buttons */}
          <button className="p-2 dark:hover:bg-slate-700 hover:bg-gray-100 rounded-lg">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 dark:hover:bg-slate-700 hover:bg-gray-100 rounded-lg">
            <DownloadIcon className="w-4 h-4" />
          </button>
          <button className="p-2 dark:hover:bg-slate-700 hover:bg-gray-100 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Advanced Table with Selection */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Advanced Table with Selection & Sorting</h2>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedRows.length} of 3 selected
            </span>
            {selectedRows.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">Edit Selected</Button>
                <Button size="sm" variant="danger">Delete Selected</Button>
              </div>
            )}
          </div>

          {/* Column Selector */}
          <div className="relative">
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center gap-2 px-3 py-2 text-sm dark:hover:bg-slate-700 hover:bg-gray-100 rounded-lg"
            >
              <Columns className="w-4 h-4" />
              Columns
            </button>

            {showColumnSelector && (
              <div className="absolute right-0 mt-2 w-48 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {allColumns.map(column => (
                    <label key={column.id} className="flex items-center px-2 py-1 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleColumns([...visibleColumns, column.id]);
                          } else {
                            setVisibleColumns(visibleColumns.filter(c => c !== column.id));
                          }
                        }}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm">{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={tableStyles.wrapper}>
          <div className="overflow-x-auto">
            <table className={tableStyles.table}>
              <thead className={tableStyles.thead}>
                <tr className={tableStyles.headerRow}>
                  <th className="w-12 px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === 3}
                      onChange={toggleAllRows}
                      className="w-4 h-4"
                    />
                  </th>
                  {visibleColumns.includes('symbol') && (
                    <th
                      className={cn(tableStyles.th, "cursor-pointer select-none")}
                      onClick={() => handleSort('symbol')}
                    >
                      <div className="flex items-center gap-1">
                        Symbol
                        {sortColumn === 'symbol' && (
                          <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.includes('price') && (
                    <th
                      className={cn(tableStyles.th, "cursor-pointer select-none")}
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center gap-1">
                        Price
                        {sortColumn === 'price' && (
                          <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  )}
                  {visibleColumns.includes('change') && <th className={tableStyles.th}>Change</th>}
                  {visibleColumns.includes('volume') && <th className={tableStyles.thRight}>Volume</th>}
                  {visibleColumns.includes('market_cap') && <th className={tableStyles.thRight}>Market Cap</th>}
                  {visibleColumns.includes('actions') && <th className={tableStyles.thCenter}>Actions</th>}
                </tr>
              </thead>
              <tbody className={tableStyles.tbody}>
                {[
                  { id: 1, symbol: 'AAPL', price: '$182.52', change: '+1.25%', volume: '$112M', marketCap: '$2.98T' },
                  { id: 2, symbol: 'GOOGL', price: '$142.65', change: '-0.48%', volume: '$89M', marketCap: '$1.82T' },
                  { id: 3, symbol: 'MSFT', price: '$378.91', change: '+2.15%', volume: '$156M', marketCap: '$2.81T' }
                ].map((row, index) => (
                  <tr key={row.id} className={cn(getTableRow(index), selectedRows.includes(row.id) && "bg-indigo-50 dark:bg-indigo-900/20")}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    {visibleColumns.includes('symbol') && <td className={tableStyles.tdBold}>{row.symbol}</td>}
                    {visibleColumns.includes('price') && <td className={tableStyles.td}>{row.price}</td>}
                    {visibleColumns.includes('change') && (
                      <td className={row.change.startsWith('+') ? tableStyles.tdSuccess : tableStyles.tdDanger}>
                        {row.change}
                      </td>
                    )}
                    {visibleColumns.includes('volume') && <td className={tableStyles.tdRight}>{row.volume}</td>}
                    {visibleColumns.includes('market_cap') && <td className={tableStyles.tdRight}>{row.marketCap}</td>}
                    {visibleColumns.includes('actions') && (
                      <td className={tableStyles.tdCenter}>
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Pagination */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Pagination Styles</h2>

        <div className="space-y-6">
          {/* Simple Pagination */}
          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Simple Pagination</p>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 text-sm dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>

              {[1, 2, 3, '...', 9, 10].map((page, index) => (
                <button
                  key={index}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg",
                    page === currentPage
                      ? "bg-indigo-600 text-white"
                      : page === '...'
                      ? "cursor-default"
                      : "dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  )}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                >
                  {page}
                </button>
              ))}

              <button
                className="px-3 py-2 text-sm dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>

          {/* Icon Pagination */}
          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Icon Pagination</p>
            <div className="flex items-center gap-1">
              <button className="p-2 dark:hover:bg-slate-700 hover:bg-gray-100 rounded-lg disabled:opacity-50" disabled>
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button className="p-2 dark:hover:bg-slate-700 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-2 text-sm">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </div>

              <button className="p-2 dark:hover:bg-slate-700 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="p-2 dark:hover:bg-slate-700 hover:bg-gray-100 rounded-lg">
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full Pagination with Info */}
          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Full Pagination with Info</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing <strong>1-10</strong> of <strong>97</strong> results
              </span>

              <div className="flex items-center gap-4">
                <select className="px-3 py-2 text-sm dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg">
                  <option>10 per page</option>
                  <option>20 per page</option>
                  <option>50 per page</option>
                </select>

                <div className="flex items-center gap-1">
                  <button className="px-3 py-2 text-sm rounded-lg dark:hover:bg-slate-700 hover:bg-gray-100">First</button>
                  <button className="px-3 py-2 text-sm rounded-lg dark:hover:bg-slate-700 hover:bg-gray-100">Prev</button>
                  <input
                    type="number"
                    value={currentPage}
                    onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-sm text-center dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded"
                  />
                  <span className="text-sm px-2">of {totalPages}</span>
                  <button className="px-3 py-2 text-sm rounded-lg dark:hover:bg-slate-700 hover:bg-gray-100">Next</button>
                  <button className="px-3 py-2 text-sm rounded-lg dark:hover:bg-slate-700 hover:bg-gray-100">Last</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Table Empty States</h2>

        <div className={tableStyles.wrapper}>
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">No Data Available</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">There are no items to display at this time.</p>
            <Button variant="primary" size="sm">Add First Item</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Core Components Section (Typography, Colors, Buttons, etc.)
function CoreComponentsSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8">
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
        </div>
      </Card>

      {/* Buttons Section */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Buttons</h2>

        <div className="space-y-6">
          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Variants (using buttonStyles.ts)</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="success">Success Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </div>

          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Raw button styles from buttonStyles.ts</p>
            <div className="flex flex-wrap gap-3">
              <button className={cn(buttonStyles.base, buttonStyles.variant.primary, buttonStyles.size.md)}>
                Direct Primary
              </button>
              <button className={cn(buttonStyles.base, buttonStyles.variant.secondary, buttonStyles.size.sm)}>
                Direct Secondary Small
              </button>
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
        </div>
      </Card>
    </div>
  );
}

// Forms Section
function FormsSection() {
  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Form Elements</h2>

        <div className="space-y-6">
          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Input Fields</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Text Input" helper="Enter any text value" required>
                <Input type="text" placeholder="Enter text..." />
              </FormField>

              <FormField label="Disabled Input">
                <Input type="text" disabled value="Disabled field" />
              </FormField>

              <FormField label="Select Dropdown">
                <Select>
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </Select>
              </FormField>

              <FormField label="With Error" error="This field has an error">
                <Input type="text" placeholder="Error state" error />
              </FormField>
            </div>
          </div>

          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Textarea</p>
            <Textarea rows={4} placeholder="Enter multiple lines of text..." />
          </div>

          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Checkboxes & Radio Buttons</p>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className={checkboxStyles.input} defaultChecked />
                <span className="dark:text-gray-300 text-gray-700">Checkbox option</span>
              </label>

              <label className="flex items-center">
                <input type="radio" name="radio-group" className={radioStyles.input} defaultChecked />
                <span className="dark:text-gray-300 text-gray-700">Radio option 1</span>
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ThemePage() {
  const [activeTab, setActiveTab] = useState("tables");

  const tabs = [
    { id: "tables", label: "Tables" },
    { id: "core", label: "Core Components" },
    { id: "forms", label: "Forms" }
  ];

  return (
    <AppLayout title="Theme Showcase">
      <PageContent>
        {/* Main Tabs */}
        <div className="mb-8">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="modern"
          />
        </div>

        {/* Tab Content */}
        {activeTab === "tables" && <TablesSection />}
        {activeTab === "core" && <CoreComponentsSection />}
        {activeTab === "forms" && <FormsSection />}
      </PageContent>
    </AppLayout>
  );
}