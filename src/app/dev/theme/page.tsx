"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { ChevronDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, Columns, Download as DownloadIcon, RefreshCw, MoreVertical } from "lucide-react";
// Icon system - using Lucide icons directly with Tailwind sizing
import { Info, AlertTriangle, XCircle, CheckCircle, Gauge, ArrowUpWideNarrow, MapPin, Atom, ArrowRightLeft, TrendingUp, TrendingDown, DollarSign, CreditCard, Plus, Edit, Trash, Download, Save, Eye, Copy, Share2 } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { GlobalRefreshIndicator } from "@/components/ui/GlobalRefreshIndicator";
import { refreshCoordinator } from "@/lib/refresh/RefreshCoordinator";
import { ThemeChart } from "./ThemeChart";

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
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-action-menu]')) {
        setOpenActionMenu(null);
      }
    };

    if (openActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openActionMenu]);

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold dark:text-white text-gray-900">Basic Table with Actions</h2>
          <div className="flex items-center gap-4">
            {/* Column Selector */}
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm dark:text-gray-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Columns className="w-4 h-4" />
              Columns
            </button>

            <span className="text-gray-300 dark:text-slate-600">|</span>

            {/* Records per page selector */}
            <select className="px-3 py-1.5 text-sm dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg">
              <option>10 rows</option>
              <option>25 rows</option>
              <option>50 rows</option>
              <option>100 rows</option>
            </select>

            {/* Icon Pagination */}
            <div className="flex items-center gap-1">
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm dark:text-gray-400 text-gray-600">
                1 of 1
              </span>
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg">
          <div className="overflow-x-auto overflow-y-visible relative">
            <table className={tableStyles.table}>
              <thead className={tableStyles.thead}>
                <tr className={tableStyles.headerRow}>
                  <th className={tableStyles.th}>Symbol</th>
                  <th className={tableStyles.th}>Price</th>
                  <th className={tableStyles.th}>Change</th>
                  <th className={tableStyles.thRight}>Volume</th>
                  <th className={tableStyles.thCenter}>Actions</th>
                </tr>
              </thead>
              <tbody className={tableStyles.tbody}>
                {[
                  { id: 'btc', symbol: 'BTC/USD', price: '$45,234.56', change: '+2.34%', volume: '$2.4B' },
                  { id: 'eth', symbol: 'ETH/USD', price: '$3,123.45', change: '-1.23%', volume: '$1.2B' },
                  { id: 'sol', symbol: 'SOL/USD', price: '$98.76', change: '+5.67%', volume: '$892M' }
                ].map((row, index) => (
                  <tr key={row.id} className={getTableRow(index)}>
                    <td className={tableStyles.tdBold}>{row.symbol}</td>
                    <td className={tableStyles.tdBold}>{row.price}</td>
                    <td className={row.change.startsWith('+') ? tableStyles.tdSuccess : tableStyles.tdDanger}>
                      {row.change}
                    </td>
                    <td className={tableStyles.tdRight}>{row.volume}</td>
                    <td className={tableStyles.tdCenter}>
                      <div className="relative" data-action-menu>
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === row.id ? null : row.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>

                        {openActionMenu === row.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border dark:border-slate-700 border-gray-200 rounded-lg shadow-lg z-50">
                            <div className="py-1">
                              <button
                                onClick={() => {
    // DEBUG: console.log('View', row.symbol);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3"
                              >
                                <Eye className="w-4 h-4 text-gray-500" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
    // DEBUG: console.log('Edit', row.symbol);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3"
                              >
                                <Edit className="w-4 h-4 text-gray-500" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
    // DEBUG: console.log('Copy', row.symbol);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3"
                              >
                                <Copy className="w-4 h-4 text-gray-500" />
                                Duplicate
                              </button>
                              <button
                                onClick={() => {
    // DEBUG: console.log('Share', row.symbol);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3"
                              >
                                <Share2 className="w-4 h-4 text-gray-500" />
                                Share
                              </button>
                              <div className="border-t dark:border-slate-700 border-gray-200 my-1"></div>
                              <button
                                onClick={() => {
    // DEBUG: console.log('Delete', row.symbol);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400"
                              >
                                <Trash className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
      <Card className="overflow-visible">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold dark:text-white text-gray-900">Advanced Table with Selection & Sorting</h2>
          <div className="flex items-center gap-4">
            {/* Column Selector */}
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm dark:text-gray-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Columns className="w-4 h-4" />
              Columns
            </button>

            <span className="text-gray-300 dark:text-slate-600">|</span>

            {/* Records per page selector */}
            <select className="px-3 py-1.5 text-sm dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg">
              <option>10 rows</option>
              <option>25 rows</option>
              <option>50 rows</option>
              <option>100 rows</option>
            </select>

            {/* Icon Pagination */}
            <div className="flex items-center gap-1">
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm dark:text-gray-400 text-gray-600">
                1 of 1
              </span>
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

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

        <div className="rounded-lg">
          <div className="overflow-x-auto overflow-y-visible relative">
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
                        <div className="relative" data-action-menu>
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === `adv-${row.id}` ? null : `adv-${row.id}`)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>

                          {openActionMenu === `adv-${row.id}` && (
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border dark:border-slate-700 border-gray-200 rounded-lg shadow-lg z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => {
    // DEBUG: console.log('View', row.symbol);
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3"
                                >
                                  <Eye className="w-4 h-4 text-gray-500" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
    // DEBUG: console.log('Edit', row.symbol);
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3"
                                >
                                  <Edit className="w-4 h-4 text-gray-500" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
    // DEBUG: console.log('Download', row.symbol);
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3"
                                >
                                  <Download className="w-4 h-4 text-gray-500" />
                                  Export Data
                                </button>
                                <div className="border-t dark:border-slate-700 border-gray-200 my-1"></div>
                                <button
                                  onClick={() => {
    // DEBUG: console.log('Delete', row.symbol);
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400"
                                >
                                  <Trash className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold dark:text-white text-gray-900">Table Empty States</h2>
          <div className="flex items-center gap-4">
            {/* Column Selector */}
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm dark:text-gray-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Columns className="w-4 h-4" />
              Columns
            </button>

            <span className="text-gray-300 dark:text-slate-600">|</span>

            {/* Records per page selector */}
            <select className="px-3 py-1.5 text-sm dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg">
              <option>10 rows</option>
              <option>25 rows</option>
              <option>50 rows</option>
              <option>100 rows</option>
            </select>

            {/* Icon Pagination */}
            <div className="flex items-center gap-1">
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm dark:text-gray-400 text-gray-600">
                0 of 0
              </span>
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="p-1.5 dark:hover:bg-slate-700 hover:bg-gray-100 rounded disabled:opacity-50" disabled>
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

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
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
                      <Info className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">No Data Available</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">There are no items to display at this time.</p>
                    <Button variant="primary" size="sm">Add First Item</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Text & Icons Section (Typography and Icons)
function TextIconsSection() {
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

      {/* Icons Section */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Icons</h2>
        <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
          Icons from lucide-react with Tailwind sizing classes. Consistent sizing across the app.
        </p>

        {/* Standard Icon Sizes */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Standard Icon Sizes (Tailwind Classes)</h3>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Info className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              <span className="text-xs dark:text-gray-500 text-gray-500">w-3 h-3 (12px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-xs dark:text-gray-500 text-gray-500">w-4 h-4 (16px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-xs dark:text-gray-500 text-gray-500">w-5 h-5 (20px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Info className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <span className="text-xs dark:text-gray-500 text-gray-500">w-6 h-6 (24px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Info className="w-7 h-7 text-gray-600 dark:text-gray-400" />
              <span className="text-xs dark:text-gray-500 text-gray-500">w-7 h-7 (28px)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Info className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              <span className="text-xs dark:text-gray-500 text-gray-500">w-8 h-8 (32px)</span>
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="mt-4 space-y-1 text-sm dark:text-gray-400 text-gray-600">
            <div className="flex items-center gap-2">
              <span><code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 rounded">w-4 h-4</code> - Inline icons, buttons, inputs</span>
            </div>
            <div className="flex items-center gap-2">
              <span><code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 rounded">w-5 h-5</code> - Navigation, action buttons</span>
            </div>
            <div className="flex items-center gap-2">
              <span><code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 rounded">w-7 h-7</code> - Alert headers, message icons</span>
            </div>
            <div className="flex items-center gap-2">
              <span><code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 rounded">w-8 h-8</code> - Feature icons, empty states</span>
            </div>
          </div>
        </div>

        {/* Common Icons by Category */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Alert Icons</h3>
            <div className="flex items-center gap-4">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <AlertTriangle className="w-5 h-5 text-warning" />
              <XCircle className="w-5 h-5 text-danger" />
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Navigation Icons</h3>
            <div className="flex items-center gap-4">
              <Gauge className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <ArrowUpWideNarrow className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <Atom className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <ArrowRightLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Trading Icons</h3>
            <div className="flex items-center gap-4">
              <TrendingUp className="w-5 h-5 text-success" />
              <TrendingDown className="w-5 h-5 text-danger" />
              <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Action Icons</h3>
            <div className="flex items-center gap-4">
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <Trash className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <Save className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-gray-100 dark:bg-slate-800 rounded">
          <div className="text-xs dark:text-gray-400 text-gray-600 space-y-2">
            <p>
              <strong>Import:</strong> <code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded">import {"{ IconName }"} from "lucide-react"</code>
            </p>
            <p>
              <strong>Sizing:</strong> <code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded">className="w-[size] h-[size]"</code>
            </p>
            <p>
              <strong>Colors:</strong> Use Tailwind text color utilities (e.g., <code className="text-xs bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded">text-gray-600</code>)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Alerts Section
function AlertsSection() {
  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Alert Variants</h2>

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

      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Alerts Without Titles</h2>

        <div className="space-y-4">
          <Alert intent="info">
            Simple info alert without a title.
          </Alert>

          <Alert intent="success">
            Operation completed successfully!
          </Alert>

          <Alert intent="warning">
            Please review this warning.
          </Alert>

          <Alert intent="error">
            An error occurred. Please try again.
          </Alert>
        </div>
      </Card>
    </div>
  );
}

// Buttons & Badges Section
function ButtonsBadgesSection() {
  return (
    <div className="space-y-8">
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
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Sizes</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </div>

          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">With Icons</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
              <Button variant="success">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="danger">
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">States</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" disabled>Disabled</Button>
              <button className={cn(buttonStyles.base, buttonStyles.variant.primary, buttonStyles.size.md, "opacity-50 cursor-wait")}>
                Loading...
              </button>
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

      {/* Badges Section */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Status Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">Active</span>
          <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">Pending</span>
          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">Closed</span>
          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">Live</span>
          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">Paper</span>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Size Variations</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded">XS</span>
          <span className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">Small</span>
          <span className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded">Medium</span>
          <span className="px-4 py-2 text-base bg-indigo-600 text-white rounded">Large</span>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Pill Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-full">Primary</span>
          <span className="px-3 py-1.5 text-sm bg-teal-500 text-white rounded-full">Success</span>
          <span className="px-3 py-1.5 text-sm bg-rose-500 text-white rounded-full">Danger</span>
          <span className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-full">Warning</span>
          <span className="px-3 py-1.5 text-sm dark:bg-slate-700 bg-gray-200 dark:text-gray-300 text-gray-700 rounded-full">Neutral</span>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Outline Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1.5 text-sm border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg">Primary Outline</span>
          <span className="px-3 py-1.5 text-sm border border-teal-500 text-teal-600 dark:text-teal-400 rounded-lg">Success Outline</span>
          <span className="px-3 py-1.5 text-sm border dark:border-slate-600 border-gray-300 dark:text-gray-300 text-gray-700 rounded-lg">Neutral Outline</span>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Badges with Icons</h2>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Warning
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-full">
            <TrendingUp className="w-4 h-4" />
            Trending
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        </div>
      </Card>
    </div>
  );
}

// Forms Section
function FormsSection() {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Filter Dropdowns */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Filter Dropdowns</h2>
        <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
          Standard dropdown styles for filters and selections used in screeners and tables
        </p>

        <div className="space-y-4">
          {/* Filter Dropdown Example */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-4 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Add Filter
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilterDropdown && "rotate-180")} />
            </button>

            {showFilterDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border dark:border-slate-700 border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                    Price Filters
                  </div>
                  {['Under $50', '$50-$100', '$100-$500', 'Over $500'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedFilter(option);
                        setShowFilterDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors",
                        selectedFilter === option && "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      )}
                    >
                      {option}
                    </button>
                  ))}

                  <div className="border-t dark:border-slate-700 border-gray-200 my-2"></div>

                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2">
                    Volume Filters
                  </div>
                  {['High Volume', 'Average Volume', 'Low Volume'].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedFilter(option);
                        setShowFilterDropdown(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors",
                        selectedFilter === option && "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Pills */}
          {selectedFilter && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active:</span>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm">
                {selectedFilter}
                <button
                  onClick={() => setSelectedFilter(null)}
                  className="ml-1 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

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

// Colors Section - comprehensive color system showcase
function ColorsSection() {
  return (
    <div className="space-y-8">
      {/* Semantic Colors */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Semantic Colors (Status)</h2>
        <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
          Use these semantic classes instead of hardcoded colors. They automatically adapt for dark mode.
        </p>

        <div className="space-y-6">
          {/* Text Colors */}
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Text Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-success text-lg font-medium">text-success</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">Positive values, profits, confirmations</p>
              </div>
              <div className="space-y-2">
                <p className="text-danger text-lg font-medium">text-danger</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">Errors, losses, destructive actions</p>
              </div>
              <div className="space-y-2">
                <p className="text-warning text-lg font-medium">text-warning</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">Warnings, pending states</p>
              </div>
              <div className="space-y-2">
                <p className="text-info text-lg font-medium">text-info</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">Information, tips, neutral</p>
              </div>
            </div>
          </div>

          {/* Background Colors */}
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Background Colors (Solid)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="bg-success text-white p-4 rounded-lg mb-2">bg-success</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">Full opacity backgrounds</p>
              </div>
              <div>
                <div className="bg-danger text-white p-4 rounded-lg mb-2">bg-danger</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">Error states</p>
              </div>
              <div>
                <div className="bg-warning text-white p-4 rounded-lg mb-2">bg-warning</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">Warning states</p>
              </div>
              <div>
                <div className="bg-info text-white p-4 rounded-lg mb-2">bg-info</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">Information</p>
              </div>
            </div>
          </div>

          {/* Background with Opacity */}
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Background Colors (With Opacity)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="bg-success/10 text-success p-4 rounded-lg mb-2 font-medium">bg-success/10</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">10% opacity - alerts</p>
              </div>
              <div>
                <div className="bg-danger/10 text-danger p-4 rounded-lg mb-2 font-medium">bg-danger/10</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">10% opacity - alerts</p>
              </div>
              <div>
                <div className="bg-warning/10 text-warning p-4 rounded-lg mb-2 font-medium">bg-warning/10</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">10% opacity - alerts</p>
              </div>
              <div>
                <div className="bg-info/10 text-info p-4 rounded-lg mb-2 font-medium">bg-info/10</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">10% opacity - alerts</p>
              </div>
              <div>
                <div className="bg-success/20 text-success p-4 rounded-lg mb-2 font-medium">bg-success/20</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">20% opacity - emphasis</p>
              </div>
              <div>
                <div className="bg-danger/20 text-danger p-4 rounded-lg mb-2 font-medium">bg-danger/20</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">20% opacity - emphasis</p>
              </div>
              <div>
                <div className="bg-warning/20 text-warning p-4 rounded-lg mb-2 font-medium">bg-warning/20</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">20% opacity - emphasis</p>
              </div>
              <div>
                <div className="bg-info/20 text-info p-4 rounded-lg mb-2 font-medium">bg-info/20</div>
                <p className="text-xs dark:text-gray-500 text-gray-500">20% opacity - emphasis</p>
              </div>
            </div>
          </div>

          {/* Border Colors */}
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Border Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border-2 border-success p-4 rounded-lg">
                <p className="text-success font-medium">border-success</p>
              </div>
              <div className="border-2 border-danger p-4 rounded-lg">
                <p className="text-danger font-medium">border-danger</p>
              </div>
              <div className="border-2 border-warning p-4 rounded-lg">
                <p className="text-warning font-medium">border-warning</p>
              </div>
              <div className="border-2 border-info p-4 rounded-lg">
                <p className="text-info font-medium">border-info</p>
              </div>
            </div>
          </div>

          {/* Border Colors with Opacity */}
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Border Colors (With Opacity)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border-2 border-success/20 p-4 rounded-lg bg-success/5">
                <p className="text-success font-medium">border-success/20</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">20% opacity border</p>
              </div>
              <div className="border-2 border-danger/20 p-4 rounded-lg bg-danger/5">
                <p className="text-danger font-medium">border-danger/20</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">20% opacity border</p>
              </div>
              <div className="border-2 border-warning/20 p-4 rounded-lg bg-warning/5">
                <p className="text-warning font-medium">border-warning/20</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">20% opacity border</p>
              </div>
              <div className="border-2 border-info/20 p-4 rounded-lg bg-info/5">
                <p className="text-info font-medium">border-info/20</p>
                <p className="text-xs dark:text-gray-500 text-gray-500">20% opacity border</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Text Hierarchy */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Text Color Hierarchy</h2>
        <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
          Consistent text colors for different content importance levels.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border dark:border-slate-700 border-gray-200 rounded">
            <span className="text-gray-900 dark:text-white font-semibold">Primary Text (Headings)</span>
            <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">text-gray-900 dark:text-white</code>
          </div>
          <div className="flex items-center justify-between p-3 border dark:border-slate-700 border-gray-200 rounded">
            <span className="text-gray-700 dark:text-gray-300">Body Text (Default)</span>
            <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">text-gray-700 dark:text-gray-300</code>
          </div>
          <div className="flex items-center justify-between p-3 border dark:border-slate-700 border-gray-200 rounded">
            <span className="text-gray-600 dark:text-gray-400">Muted Text (Secondary)</span>
            <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">text-gray-600 dark:text-gray-400</code>
          </div>
          <div className="flex items-center justify-between p-3 border dark:border-slate-700 border-gray-200 rounded">
            <span className="text-gray-500 dark:text-gray-500">Subtle Text (Least Important)</span>
            <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">text-gray-500 dark:text-gray-500</code>
          </div>
        </div>
      </Card>

      {/* Trading-Specific Colors */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Trading-Specific Colors</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">P&L Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded">
                <span className="text-success font-mono">+$1,234.56</span>
                <code className="text-xs">text-success</code>
              </div>
              <div className="flex items-center justify-between p-3 bg-danger/10 rounded">
                <span className="text-danger font-mono">-$567.89</span>
                <code className="text-xs">text-danger</code>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-slate-700 rounded">
                <span className="text-gray-600 dark:text-gray-400 font-mono">$0.00</span>
                <code className="text-xs">text-gray-600</code>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Trading Mode Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border-2 border-blue-500 dark:border-blue-400 rounded">
                <span className="text-blue-600 dark:text-blue-400 font-medium">Live Trading</span>
                <code className="text-xs">text-blue-600</code>
              </div>
              <div className="flex items-center justify-between p-3 border-2 border-purple-500 dark:border-purple-400 rounded">
                <span className="text-purple-600 dark:text-purple-400 font-medium">Paper Trading</span>
                <code className="text-xs">text-purple-600</code>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Comprehensive Border Colors */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Complete Border Color System</h2>
        <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
          All available border colors including neutrals, semantics, and brand colors.
        </p>

        <div className="space-y-6">
          {/* Neutral Borders */}
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Neutral Borders</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border p-4 rounded border-gray-200 dark:border-slate-700">
                <p className="text-sm font-medium">Default</p>
                <code className="text-xs">border-gray-200</code>
              </div>
              <div className="border-2 p-4 rounded border-gray-300 dark:border-slate-600">
                <p className="text-sm font-medium">Medium</p>
                <code className="text-xs">border-gray-300</code>
              </div>
              <div className="border-2 p-4 rounded border-gray-400 dark:border-slate-500">
                <p className="text-sm font-medium">Strong</p>
                <code className="text-xs">border-gray-400</code>
              </div>
              <div className="border-2 p-4 rounded border-gray-500 dark:border-slate-400">
                <p className="text-sm font-medium">Bold</p>
                <code className="text-xs">border-gray-500</code>
              </div>
            </div>
          </div>

          {/* Brand Borders */}
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Brand Borders</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border-2 border-indigo-500 p-4 rounded-lg">
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">Primary</p>
                <code className="text-xs">border-indigo-500</code>
              </div>
              <div className="border-2 border-purple-500 p-4 rounded-lg">
                <p className="text-purple-600 dark:text-purple-400 font-medium">Purple</p>
                <code className="text-xs">border-purple-500</code>
              </div>
              <div className="border-2 border-slate-800 dark:border-slate-300 p-4 rounded-lg">
                <p className="font-medium">Contrast</p>
                <code className="text-xs">border-slate-800</code>
              </div>
            </div>
          </div>

          {/* Focus State Borders */}
          <div>
            <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-3">Focus & Active States</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border-2 border-indigo-500 p-4 rounded-lg ring-2 ring-indigo-500/20">
                <p className="text-sm font-medium">Focus Ring</p>
                <code className="text-xs">focus:border-indigo-500</code>
              </div>
              <div className="border-2 border-gray-300 hover:border-gray-500 dark:border-slate-600 dark:hover:border-slate-400 p-4 rounded-lg transition-colors cursor-pointer">
                <p className="text-sm font-medium">Hover (try it)</p>
                <code className="text-xs">hover:border-gray-500</code>
              </div>
              <div className="border-2 border-red-500 p-4 rounded-lg">
                <p className="text-sm font-medium">Error State</p>
                <code className="text-xs">border-red-500</code>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Brand Colors */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">TrendDojo Brand Colors</h2>
        <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
          Primary brand colors from our design system. These are used for CTAs and branding.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <div className="w-full h-20 bg-indigo-600 rounded-lg mb-2"></div>
            <p className="text-sm font-medium">Primary</p>
            <p className="text-xs dark:text-gray-500 text-gray-500">indigo-600</p>
          </div>
          <div>
            <div className="w-full h-20 bg-purple-600 rounded-lg mb-2"></div>
            <p className="text-sm font-medium">Purple Accent</p>
            <p className="text-xs dark:text-gray-500 text-gray-500">purple-600</p>
          </div>
          <div>
            <div className="w-full h-20 bg-slate-900 rounded-lg mb-2"></div>
            <p className="text-sm font-medium">Dark BG</p>
            <p className="text-xs dark:text-gray-500 text-gray-500">slate-900</p>
          </div>
          <div>
            <div className="w-full h-20 bg-slate-800 rounded-lg mb-2"></div>
            <p className="text-sm font-medium">Card BG</p>
            <p className="text-xs dark:text-gray-500 text-gray-500">slate-800</p>
          </div>
          <div>
            <div className="w-full h-20 bg-teal-500 rounded-lg mb-2"></div>
            <p className="text-sm font-medium">Success</p>
            <p className="text-xs dark:text-gray-500 text-gray-500">teal-500</p>
          </div>
          <div>
            <div className="w-full h-20 bg-rose-500 rounded-lg mb-2"></div>
            <p className="text-sm font-medium">Danger</p>
            <p className="text-xs dark:text-gray-500 text-gray-500">rose-500</p>
          </div>
        </div>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Color Usage Guidelines</h2>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">✅ DO: Use Semantic Classes</h3>
            <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-400">
              <li>• Use <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">text-success</code> for positive values</li>
              <li>• Use <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">bg-danger/10</code> for error messages</li>
              <li>• Use <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">border-warning</code> for warning states</li>
            </ul>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">❌ DON'T: Use Raw Colors</h3>
            <ul className="text-sm space-y-1 text-red-800 dark:text-red-400">
              <li>• Avoid <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">text-green-500</code> - use semantic classes</li>
              <li>• Avoid <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">bg-red-100</code> - use bg-danger/10</li>
              <li>• Avoid inline styles with hex colors</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
            <h3 className="font-semibold mb-2">📝 Quick Reference</h3>
            <div className="text-sm space-y-2 font-mono">
              <div>✓ Profits/Success → <span className="text-success">text-success</span></div>
              <div>✓ Losses/Errors → <span className="text-danger">text-danger</span></div>
              <div>✓ Warnings → <span className="text-warning">text-warning</span></div>
              <div>✓ Information → <span className="text-info">text-info</span></div>
              <div>✓ Muted content → <span className="text-gray-600 dark:text-gray-400">text-gray-600 dark:text-gray-400</span></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Panels & Borders Section
function PanelsBordersSection() {
  return (
    <div className="space-y-8">
      {/* Dashboard Panels */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Dashboard Panels</h2>
        <p className="text-sm dark:text-gray-400 text-gray-600 mb-4">
          Standard panel styles used across dashboards and data displays
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Stat Panel */}
          <div className="p-4 dark:bg-slate-800/50 bg-gray-50 rounded-lg">
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Day's Gain</p>
            <p className="text-xl font-semibold text-success">+$1,234.56</p>
            <p className="text-sm text-success">+2.34%</p>
          </div>

          {/* Info Panel */}
          <div className="p-4 dark:bg-slate-800/50 bg-gray-50 rounded-lg">
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-1">Total Value</p>
            <p className="text-xl font-semibold">$52,750.00</p>
            <p className="text-sm dark:text-gray-500 text-gray-500">5 positions</p>
          </div>

          {/* Chart Container */}
          <div className="md:col-span-2 h-32 dark:bg-slate-800/50 bg-gray-100 rounded-lg p-4">
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-2">Chart Container</p>
            <div className="h-20 flex items-end justify-between gap-1">
              {[45, 52, 48, 65, 54, 69, 72].map((height, i) => (
                <div key={i} className="flex-1 bg-indigo-500 rounded-t opacity-60" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Card Styles */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Card Styles</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Basic Card</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Standard card component with default styling
            </p>
          </Card>

          <Card className="p-4 dark:bg-slate-800/50 bg-gray-50">
            <h3 className="font-semibold mb-2">Dashboard Card</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Used for dashboard panels and data displays
            </p>
          </Card>
        </div>
      </Card>

      {/* Border Styles */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Border Styles</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border dark:border-slate-700 border-gray-200 rounded">
            <p className="text-sm font-medium">Default Border</p>
            <code className="text-xs">border dark:border-slate-700 border-gray-200</code>
          </div>

          <div className="p-4 border-2 dark:border-slate-600 border-gray-300 rounded">
            <p className="text-sm font-medium">Thick Border</p>
            <code className="text-xs">border-2 dark:border-slate-600 border-gray-300</code>
          </div>
        </div>
      </Card>

      {/* Rounded Corners */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Rounded Corners</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border dark:border-slate-700 border-gray-200 rounded">
            <p className="text-sm font-medium">Small</p>
            <code className="text-xs">rounded</code>
          </div>

          <div className="p-4 border dark:border-slate-700 border-gray-200 rounded-lg">
            <p className="text-sm font-medium">Large</p>
            <code className="text-xs">rounded-lg</code>
          </div>
        </div>
      </Card>

      {/* Dividers */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Dividers</h2>

        <div className="space-y-6">
          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Horizontal Divider</p>
            <div className="space-y-3">
              <p>Content above divider</p>
              <hr className="border-gray-200 dark:border-slate-700" />
              <p>Content below divider</p>
            </div>
          </div>

          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Thick Divider</p>
            <div className="space-y-3">
              <p>Content above</p>
              <hr className="border-2 border-gray-300 dark:border-slate-600" />
              <p>Content below</p>
            </div>
          </div>

          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Gradient Divider</p>
            <div className="space-y-3">
              <p>Content above</p>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-400 dark:via-slate-600 to-transparent"></div>
              <p>Content below</p>
            </div>
          </div>

          <div>
            <p className="text-sm dark:text-gray-500 text-gray-500 mb-3">Vertical Divider</p>
            <div className="flex items-center gap-4">
              <span>Left content</span>
              <div className="w-px h-8 bg-gray-300 dark:bg-slate-600"></div>
              <span>Right content</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Special Effects */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Special Effects</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border dark:border-slate-700 border-gray-200 rounded-lg ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900">
            <p className="text-sm font-medium">Focus Ring</p>
            <code className="text-xs">ring-2 ring-indigo-500</code>
          </div>

          <div className="p-4 border dark:border-slate-700 border-gray-200 rounded-lg shadow-inner">
            <p className="text-sm font-medium">Inner Shadow</p>
            <code className="text-xs">shadow-inner</code>
          </div>

          <div className="p-4 relative overflow-hidden border dark:border-slate-700 border-gray-200 rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20"></div>
            <div className="relative">
              <p className="text-sm font-medium">Overlay Effect</p>
              <code className="text-xs">absolute inset-0</code>
            </div>
          </div>

          <div className="p-4 border dark:border-slate-700 border-gray-200 rounded-lg backdrop-blur-sm bg-white/80 dark:bg-slate-800/80">
            <p className="text-sm font-medium">Backdrop Blur</p>
            <code className="text-xs">backdrop-blur-sm</code>
          </div>
        </div>
      </Card>
    </div>
  );
}

// App Functions Section - showcases app-level functionality components
function AppFunctionsSection() {
  const [refreshDemo, setRefreshDemo] = useState<'market-data' | 'positions' | 'broker-data' | 'strategies'>('market-data');

  const triggerDemoRefresh = (type: 'market-data' | 'positions' | 'broker-data' | 'strategies') => {
    refreshCoordinator.triggerRefresh(type);
    setRefreshDemo(type);
  };

  return (
    <div className="space-y-8">
      {/* Global Refresh System */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Global Refresh System</h2>

        <div className="space-y-6">
          {/* Live Example */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Refresh Indicator (Dev Mode)</h3>
            <GlobalRefreshIndicator variant="dev" position="inline" />
          </div>

          {/* Different Variants */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Refresh Indicator Variants</h3>

            <div className="grid gap-4">
              {/* Minimal */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Minimal (Production)</div>
                  <div className="text-xs text-gray-500">Compact status indicator</div>
                </div>
                <GlobalRefreshIndicator variant="minimal" />
              </div>

              {/* Compact */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Compact</div>
                  <div className="text-xs text-gray-500">With basic controls</div>
                </div>
                <GlobalRefreshIndicator variant="compact" />
              </div>

              {/* Detailed */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Detailed</div>
                  <div className="text-xs text-gray-500">Shows all refresh types</div>
                </div>
                <GlobalRefreshIndicator variant="detailed" showDetails={true} />
              </div>
            </div>
          </div>

          {/* Trigger Demo Refreshes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Trigger Demo Refreshes</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => triggerDemoRefresh('market-data')}
                className={refreshDemo === 'market-data' ? 'ring-2 ring-blue-500' : ''}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Market Data
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => triggerDemoRefresh('positions')}
                className={refreshDemo === 'positions' ? 'ring-2 ring-blue-500' : ''}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Positions
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => triggerDemoRefresh('broker-data')}
                className={refreshDemo === 'broker-data' ? 'ring-2 ring-blue-500' : ''}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Broker Data
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => triggerDemoRefresh('strategies')}
                className={refreshDemo === 'strategies' ? 'ring-2 ring-blue-500' : ''}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Strategies
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => refreshCoordinator.triggerRefresh('global')}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Global Refresh
              </Button>
            </div>
          </div>

          {/* Usage Documentation */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Usage in Components</h3>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <div className="text-green-400">// Import the component and coordinator</div>
              <div>import {"{ GlobalRefreshIndicator }"} from '@/components/ui/GlobalRefreshIndicator';</div>
              <div>import {"{ refreshCoordinator }"} from '@/lib/refresh/RefreshCoordinator';</div>
              <div className="mt-3 text-green-400">// Use in your layout</div>
              <div>{"<GlobalRefreshIndicator variant=\"compact\" />"}</div>
              <div className="mt-3 text-green-400">// Subscribe to refresh events</div>
              <div>{"useEffect(() => {"}</div>
              <div className="pl-4">{"  const unsubscribe = refreshCoordinator.subscribe('market-data', async () => {"}</div>
              <div className="pl-8">{"    // Fetch new data"}</div>
              <div className="pl-8">{"    await fetchMarketData();"}</div>
              <div className="pl-4">{"  });"}</div>
              <div className="pl-4">{"  return unsubscribe;"}</div>
              <div>{"}, []);"}</div>
              <div className="mt-3 text-green-400">// Trigger a refresh</div>
              <div>refreshCoordinator.triggerRefresh('market-data');</div>
            </div>
          </div>

          {/* Architecture Notes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Architecture Notes</h3>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <strong>Unified System:</strong> All refresh activity flows through the RefreshCoordinator singleton
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <strong>Event Types:</strong> global, market-data, broker-data, positions, strategies, user-data
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <strong>Cooldowns:</strong> Built-in rate limiting prevents excessive API calls
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <strong>Dev Mode:</strong> Enhanced visibility in development with history, stats, and manual controls
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Future App Functions */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">Other App Functions (Future)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="font-medium mb-2">Notification System</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Toast notifications, alerts, and in-app messaging</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="font-medium mb-2">Command Palette</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cmd+K quick actions and navigation</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Global hotkeys for power users</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="font-medium mb-2">Data Export</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">CSV, Excel, PDF export functionality</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Charts Section
function ChartsSection() {
  return (
    <div className="space-y-8">
      {/* Main Chart with Theme System */}
      <ThemeChart />

      {/* Color Documentation */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">
          Chart Color System
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-3">Bullish/Buy Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 bg-teal-500 rounded"></div>
                <span className="text-sm">
                  <code className="px-1 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-xs">teal-500</code>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">#14b8a6</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 bg-teal-500 bg-opacity-40 rounded"></div>
                <span className="text-sm">
                  <code className="px-1 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-xs">volume up</code>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">40% opacity</span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Bearish/Sell Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 bg-rose-500 rounded"></div>
                <span className="text-sm">
                  <code className="px-1 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-xs">rose-500</code>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">#f43f5e</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 bg-rose-500 bg-opacity-40 rounded"></div>
                <span className="text-sm">
                  <code className="px-1 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-xs">volume down</code>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">40% opacity</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">
          Implementation Guide
        </h2>

        <div className="space-y-4">
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
            <div className="text-green-400">// Import chart styles</div>
            <div>import {"{ getCandlestickConfig, getChartConfig }"} from '@/lib/chartStyles';</div>
            <div className="mt-3 text-green-400">// Get theme configuration</div>
            <div>const isDarkMode = document.documentElement.classList.contains('dark');</div>
            <div>const candlestickConfig = getCandlestickConfig(isDarkMode);</div>
            <div>const chartConfig = getChartConfig(isDarkMode, '#9CA3AF');</div>
            <div className="mt-3 text-green-400">// Apply to chart</div>
            <div>const candlestickSeries = chart.addCandlestickSeries(candlestickConfig);</div>
          </div>

          <div className="text-sm dark:text-gray-400 text-gray-600">
            <p className="mb-2">All chart components should:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Import configuration from <code className="px-1 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-xs">/src/lib/chartStyles.ts</code></li>
              <li>Detect dark mode using <code className="px-1 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-xs">document.documentElement.classList.contains('dark')</code></li>
              <li>Apply theme configuration to all series types</li>
              <li>Use dynamic imports to avoid SSR issues</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Chart Types */}
      <Card>
        <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-6">
          Supported Chart Types
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="font-medium mb-2">Candlestick Charts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Primary chart type for price action with OHLC data
            </p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="font-medium mb-2">Line Charts</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Simple line series for trends and indicators
            </p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
            <h3 className="font-medium mb-2">Volume Histograms</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bar charts for volume with color coding
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ThemePage() {
  const [activeTab, setActiveTab] = useState("text-icons");

  const tabs = [
    { id: "text-icons", label: "Text & Icons" },
    { id: "colors", label: "Colors" },
    { id: "buttons-badges", label: "Buttons & Badges" },
    { id: "panels-borders", label: "Panels & Borders" },
    { id: "tables", label: "Tables" },
    { id: "alerts", label: "Alerts" },
    { id: "forms", label: "Forms" },
    { id: "charts", label: "Charts" },
    { id: "app-functions", label: "App Functions" }
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
        {activeTab === "text-icons" && <TextIconsSection />}
        {activeTab === "colors" && <ColorsSection />}
        {activeTab === "buttons-badges" && <ButtonsBadgesSection />}
        {activeTab === "panels-borders" && <PanelsBordersSection />}
        {activeTab === "tables" && <TablesSection />}
        {activeTab === "alerts" && <AlertsSection />}
        {activeTab === "forms" && <FormsSection />}
        {activeTab === "charts" && <ChartsSection />}
        {activeTab === "app-functions" && <AppFunctionsSection />}
      </PageContent>
    </AppLayout>
  );
}