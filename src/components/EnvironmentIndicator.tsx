'use client'

import { useEffect, useState } from 'react'
import { getEnvironmentConfig, getTradingSafetyWarnings, type Environment } from '@/lib/config/environment'

export function EnvironmentIndicator() {
  const [config, setConfig] = useState<Environment | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  
  useEffect(() => {
    // Only run on client to get accurate environment
    const envConfig = getEnvironmentConfig()
    const tradingWarnings = getTradingSafetyWarnings()
    
    setConfig(envConfig)
    setWarnings(tradingWarnings)
  }, [])
  
  // Don't show in production or during SSR
  if (!config || config.isProduction || !config.environmentLabel) {
    return null
  }
  
  const handleClick = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Main Environment Badge */}
      <div 
        className={`fixed bottom-4 left-4 z-50 cursor-pointer transition-all duration-200 ${
          isExpanded ? 'scale-105' : 'hover:scale-105'
        }`}
        onClick={handleClick}
      >
        <div className={`px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg animate-pulse border-2 bg-slate-800 ${config.environmentColor} backdrop-blur-sm`}>
          {config.environmentLabel}
          {config.realMoneyMode && (
            <span className="ml-1 inline-block w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
          )}
        </div>
      </div>

      {/* Expanded Safety Information */}
      {isExpanded && (
        <div className="fixed bottom-16 left-4 z-50 max-w-xs">
          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl border border-gray-700 p-3">
            <div className="font-semibold mb-2 text-yellow-400">Trading Environment</div>
            
            {warnings.map((warning, index) => (
              <div 
                key={index}
                className={`flex items-center gap-2 mb-1 ${
                  warning.includes('REAL MONEY') ? 'text-red-400' : 'text-gray-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  warning.includes('REAL MONEY') ? 'bg-red-400 animate-pulse' : 'bg-blue-400'
                }`}></span>
                <span>{warning}</span>
              </div>
            ))}
            
            <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400">
              Environment: {config.environment}<br/>
              Base URL: {config.baseUrl.replace('http://localhost:3000', 'localhost:3000')}
            </div>
            
            <button
              onClick={() => setIsExpanded(false)}
              className="mt-2 text-gray-500 hover:text-gray-300 text-xs"
            >
              Click to collapse
            </button>
          </div>
        </div>
      )}

      {/* Critical Real Money Warning Banner */}
      {config.realMoneyMode && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-red-600 text-white text-center py-1 text-xs font-bold animate-pulse">
          ⚠️ REAL MONEY TRADING ENABLED - TRADES WILL USE ACTUAL FUNDS ⚠️
        </div>
      )}

      {/* Paper Trading Indicator */}
      {config.paperTradingMode && !config.realMoneyMode && !config.isProduction && (
        <div className="fixed top-0 right-4 z-40 mt-2">
          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            📊 PAPER TRADING
          </div>
        </div>
      )}
    </>
  )
}