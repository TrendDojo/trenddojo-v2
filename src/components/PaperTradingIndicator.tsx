"use client";

import { cn } from "@/lib/utils";

export function PaperTradingIndicator() {
  return (
    <div className="fixed bottom-20 left-4 z-50">
      <div className={cn(
        "px-4 py-2 rounded-full flex items-center gap-2",
        "bg-teal-600 text-white font-medium",
        "shadow-lg"
      )}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>PAPER TRADING</span>
      </div>
    </div>
  );
}