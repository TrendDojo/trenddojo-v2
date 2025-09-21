'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, Activity, DollarSign, BarChart3, Settings, Pause, Play, X } from 'lucide-react'

interface Strategy {
  id: string
  name: string
  description?: string
  status: string
  type?: string
  allocatedCapital?: number
  maxPositions: number
  openPositions: number
  totalPnl: number
  netPnl: number
  winRate?: number
  profitFactor?: number
  positions?: Array<{
    id: string
    symbol: string
    currentQuantity: number
    unrealizedPnl?: number
  }>
}

interface StrategyDashboardProps {
  portfolioId: string
}

export function StrategyDashboard({ portfolioId }: StrategyDashboardProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchStrategies()
  }, [portfolioId])

  const fetchStrategies = async () => {
    try {
      const response = await fetch(`/api/strategies?portfolioId=${portfolioId}`)
      const data = await response.json()
      setStrategies(data)
    } catch (error) {
      console.error('Failed to fetch strategies:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStrategyStatus = async (strategy: Strategy) => {
    const newStatus = strategy.status === 'active' ? 'paused' : 'active'
    try {
      await fetch('/api/strategies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: strategy.id, status: newStatus }),
      })
      fetchStrategies()
    } catch (error) {
      console.error('Failed to update strategy:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10'
      case 'paused': return 'text-yellow-600 bg-yellow-50'
      case 'closed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'momentum': return <TrendingUp className="h-5 w-5" />
      case 'mean_reversion': return <Activity className="h-5 w-5" />
      case 'breakout': return <BarChart3 className="h-5 w-5" />
      default: return <Activity className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Trading Strategies</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Strategy
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Strategies</p>
              <p className="text-2xl font-bold">{strategies.length}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Strategies</p>
              <p className="text-2xl font-bold">
                {strategies.filter(s => s.status === 'active').length}
              </p>
            </div>
            <Play className="h-8 w-8 text-success" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total P&L</p>
              <p className={`text-2xl font-bold ${
                strategies.reduce((sum, s) => sum + s.netPnl, 0) >= 0 
                  ? 'text-success' 
                  : 'text-danger'
              }`}>
                ${strategies.reduce((sum, s) => sum + s.netPnl, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Win Rate</p>
              <p className="text-2xl font-bold">
                {strategies.length > 0
                  ? Math.round(
                      strategies.reduce((sum, s) => sum + (s.winRate || 0), 0) / 
                      strategies.filter(s => s.winRate).length
                    )
                  : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Strategy Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(strategy.type)}
                  <h3 className="font-semibold text-lg">{strategy.name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(strategy.status)}`}>
                  {strategy.status}
                </span>
              </div>
              {strategy.description && (
                <p className="text-sm text-gray-600">{strategy.description}</p>
              )}
            </div>

            {/* Strategy Metrics */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Allocated Capital</span>
                <span className="font-medium">
                  ${(strategy.allocatedCapital || 0).toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Positions</span>
                <span className="font-medium">
                  {strategy.openPositions || 0} / {strategy.maxPositions}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Net P&L</span>
                <span className={`font-medium ${strategy.netPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${strategy.netPnl.toLocaleString()}
                </span>
              </div>
              
              {strategy.winRate !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-medium">{Math.round(strategy.winRate)}%</span>
                </div>
              )}
              
              {strategy.profitFactor !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Profit Factor</span>
                  <span className="font-medium">{strategy.profitFactor.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Strategy Actions */}
            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <button
                onClick={() => toggleStrategyStatus(strategy)}
                className={`flex items-center px-3 py-1 rounded text-sm font-medium transition ${
                  strategy.status === 'active'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-success/20 text-success hover:bg-success/30'
                }`}
              >
                {strategy.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Activate
                  </>
                )}
              </button>
              
              <button className="flex items-center px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <CreateStrategyModal
          portfolioId={portfolioId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchStrategies()
          }}
        />
      )}
    </div>
  )
}

// Create Strategy Modal Component
function CreateStrategyModal({ 
  portfolioId, 
  onClose, 
  onSuccess 
}: { 
  portfolioId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'momentum',
    allocatedCapital: '',
    maxPositions: '5',
    maxRiskPercent: '2',
    maxDrawdown: '10',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId,
          ...formData,
          allocatedCapital: parseFloat(formData.allocatedCapital),
          maxPositions: parseInt(formData.maxPositions),
          maxRiskPercent: parseFloat(formData.maxRiskPercent),
          maxDrawdown: parseFloat(formData.maxDrawdown),
        }),
      })
      
      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to create strategy:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Strategy</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strategy Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Strategy Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="momentum">Momentum</option>
              <option value="mean_reversion">Mean Reversion</option>
              <option value="breakout">Breakout</option>
              <option value="swing">Swing</option>
              <option value="scalp">Scalping</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allocated Capital ($)
            </label>
            <input
              type="number"
              required
              value={formData.allocatedCapital}
              onChange={(e) => setFormData({ ...formData, allocatedCapital: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Positions
              </label>
              <input
                type="number"
                required
                value={formData.maxPositions}
                onChange={(e) => setFormData({ ...formData, maxPositions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Risk (%)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.maxRiskPercent}
                onChange={(e) => setFormData({ ...formData, maxRiskPercent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Strategy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}