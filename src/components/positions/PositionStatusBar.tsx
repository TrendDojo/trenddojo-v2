"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// MINIMAL CONFIGURATION - Just the essentials
// ============================================================================
const CONFIG = {
  containerWidth: 120,
  minStopWidth: 15,
  minSegmentWidth: 8,
};

// ============================================================================
// TYPES
// ============================================================================
interface ScalingLevel {
  quantity: number;
  targetPrice: number;
  executed: boolean;
  executedPrice?: number;
  executedDate?: string;
}

interface PositionStatusBarProps {
  side: "long" | "short";
  quantity: number;
  originalQuantity: number;
  entryPrice?: number;
  currentPrice?: number;
  stopLoss?: number;
  targetPrice?: number;
  scalingLevels?: ScalingLevel[];
  status?: "active" | "pending" | "closed";
  exitReason?: "stop_loss" | "take_profit" | "manual" | "partial";
  pnl?: number;
}

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

// Play symbol for entry (▶) - always filled
const PlaySymbol = ({ color }: { color: "green" | "red" }) => {
  const borderColor = color === "green"
    ? "border-l-green-600 dark:border-l-green-500"
    : "border-l-red-600 dark:border-l-red-500";

  return (
    <div
      className={cn(
        "w-0 h-0 flex-shrink-0",
        "border-l-[9px] border-y-[5.4px]",
        "border-y-transparent",
        borderColor
      )}
      title="Entry"
    />
  );
};

// Bullseye for targets (◎/◉) - three concentric circles
const Bullseye = ({ filled, color }: { filled: boolean; color: "green" | "red" }) => {
  // Using theme colors: bg-up (green) for longs, bg-down (red) for shorts
  const centerColor = color === "green" ? "bg-up" : "bg-down";
  const borderColor = color === "green" ? "border-up" : "border-down";

  // Total size: 3px center + 1px transparent + 2px outer = 9px total
  return (
    <div
      className="relative w-[9px] h-[9px] flex-shrink-0 flex items-center justify-center"
      title={filled ? "Target (reached)" : "Target"}
    >
      {/* Outer ring - solid border uses the theme color (2px width) */}
      <div className={cn(
        "absolute inset-0 rounded-full border-2",
        borderColor
      )} />

      {/* Middle ring - transparent separator (1px width) */}
      <div className="absolute inset-[1px] rounded-full border border-transparent" />

      {/* Center circle (3px) - always solid with theme color */}
      <div className={cn(
        "w-[3px] h-[3px] rounded-full",
        centerColor
      )} />
    </div>
  );
};

// Stop indicator square - always filled
const StopSquare = ({ color }: { color: "green" | "red" }) => (
  <div
    className={cn(
      "w-[9px] h-[9px] flex-shrink-0",
      color === "green" ? "bg-up" : "bg-down"
    )}
    title="Stop"
  />
);

// Current price indicator
const CurrentPriceIndicator = () => (
  <div className="w-2 h-2 rounded-full border-2 border-indigo-600 dark:border-indigo-500 bg-transparent flex-shrink-0" />
);

// Scaling level indicator (smaller dot for partial profit taking)
const ScalingIndicator = ({ executed, color }: { executed: boolean; color: "green" | "red" }) => (
  <div
    className={cn(
      "w-1 h-1 rounded-full flex-shrink-0",
      executed
        ? (color === "green" ? "bg-up" : "bg-down")
        : `border ${color === "green" ? "border-up" : "border-down"}`
    )}
    title={executed ? "Scaling level (executed)" : "Scaling level"}
  />
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function PositionStatusBar({
  side,
  quantity,
  originalQuantity,
  entryPrice,
  currentPrice,
  stopLoss,
  targetPrice,
  scalingLevels,
  status = "active",
  exitReason,
  pnl = 0
}: PositionStatusBarProps) {

  // Determine colors
  const stopColor = side === "long" ? "red" : "green";
  const targetColor = side === "long" ? "green" : "red";

  // For closed positions
  const isClosedPosition = status === "closed";

  // Calculate if we need open-ended segment
  const hasTarget = !!targetPrice || (scalingLevels && scalingLevels.length > 0);
  const needsOpenEndedSegment = !hasTarget && status === "active";

  // Calculate current price position as percentage
  const getCurrentPricePosition = () => {
    if (!currentPrice || !entryPrice || !stopLoss) return "50%";

    // Determine the range based on what we have
    const leftPrice = stopLoss;
    const rightPrice = targetPrice || entryPrice + (entryPrice - stopLoss); // Mirror distance if no target

    // For longs: stop < entry < target
    // For shorts: stop > entry > target
    const range = Math.abs(rightPrice - leftPrice);
    const currentOffset = Math.abs(currentPrice - leftPrice);
    const percentage = (currentOffset / range) * 100;

    // Account for stop segment width and gaps
    const stopSegmentWidth = CONFIG.minStopWidth + 9; // Stop segment + stop square
    const totalWidth = CONFIG.containerWidth;
    const availableWidth = totalWidth - stopSegmentWidth - 3; // Minus gap

    // Calculate actual pixel position
    const pixelPosition = stopSegmentWidth + 3 + (availableWidth * percentage / 100);
    return `${pixelPosition}px`;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Container for top and middle rows only */}
      <div
        className="inline-flex flex-col"
        style={{ width: CONFIG.containerWidth }}
      >
        {/* Top row - Current Price */}
        <div className="h-2 flex items-center relative mb-[10px]">
          {currentPrice && status === "active" && (
            <div className="absolute flex flex-col items-center" style={{ left: getCurrentPricePosition(), transform: 'translateX(-50%)' }}>
              <span className="relative px-0.5 text-[11px] font-mono text-white bg-indigo-700 dark:bg-indigo-600 whitespace-nowrap">
                ${currentPrice.toFixed(0)}
                {/* Vertical line starting from top of this span and extending down */}
                <div className="absolute left-0 top-0 w-[1.5px] h-[21px] bg-indigo-700 dark:bg-indigo-600" />
              </span>
            </div>
          )}
        </div>

        {/* Middle row - Segments only */}
        <div className="flex items-center gap-[3px] mb-[2.5px]">

          {/* Stop Segment - starts at left edge, extends to just past stop square */}
          {stopLoss && entryPrice && (
            <div
              className={cn(
                "h-2 rounded-full flex-shrink-0",
                exitReason === "stop_loss"
                  ? (stopColor === "green" ? "bg-up" : "bg-down")
                  : isClosedPosition
                  ? "bg-gray-300 dark:bg-gray-700"
                  : `border ${stopColor === "green" ? "border-up" : "border-down"}`
              )}
              style={{ width: `${CONFIG.minStopWidth + 9}px` }} // Extended to cover stop square (9px)
            />
          )}

          {/* Target/Position Segments - divided by scaling levels */}
          {(targetPrice || needsOpenEndedSegment || scalingLevels) && (
            <div className="flex-grow flex items-center gap-[3px]">
              {/* Create segments based on scaling levels */}
              {(() => {
                // If no scaling levels, render single segment
                if (!scalingLevels || scalingLevels.length === 0) {
                  return (
                    <div
                      className={cn(
                        "h-2 flex-grow",
                        needsOpenEndedSegment
                          ? `rounded-l-full border-t border-b border-l ${targetColor === "green" ? "border-up" : "border-down"}`
                          : "rounded-full",
                        !needsOpenEndedSegment && (
                          exitReason === "take_profit"
                            ? (targetColor === "green" ? "bg-up" : "bg-down")
                            : isClosedPosition
                            ? "bg-gray-300 dark:bg-gray-700"
                            : `border ${targetColor === "green" ? "border-up" : "border-down"}`
                        )
                      )}
                    />
                  );
                }

                // Sort scaling levels by target price
                const sortedLevels = [...scalingLevels].sort((a, b) =>
                  side === "long" ? a.targetPrice - b.targetPrice : b.targetPrice - a.targetPrice
                );

                // Calculate width percentages for each segment
                const segments = [];
                let previousPrice = entryPrice || 0;
                const finalTarget = targetPrice || sortedLevels[sortedLevels.length - 1]?.targetPrice;

                if (!finalTarget) return null;

                const totalRange = Math.abs(finalTarget - previousPrice);

                // Create segments for each scaling level
                sortedLevels.forEach((level, index) => {
                  const segmentRange = Math.abs(level.targetPrice - previousPrice);
                  const widthPercent = (segmentRange / totalRange) * 100;

                  segments.push({
                    width: `${widthPercent}%`,
                    executed: level.executed,
                    isFirst: index === 0,
                    isLast: false
                  });

                  previousPrice = level.targetPrice;
                });

                // Add final segment to target if target exists beyond last scaling level
                if (targetPrice && previousPrice !== targetPrice) {
                  const segmentRange = Math.abs(targetPrice - previousPrice);
                  const widthPercent = (segmentRange / totalRange) * 100;
                  segments.push({
                    width: `${widthPercent}%`,
                    executed: exitReason === "take_profit",
                    isFirst: segments.length === 0,
                    isLast: true
                  });
                }

                // Render segments with fully rounded ends
                return segments.map((segment, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 rounded-full", // All segments have fully rounded ends
                      segment.executed
                        ? (targetColor === "green" ? "bg-up" : "bg-down")
                        : `border ${targetColor === "green" ? "border-up" : "border-down"}`
                    )}
                    style={{ width: segment.width }}
                  />
                ));
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row - Stop loss, fixed container for entry, target price */}
      <div className="flex items-center">

        {/* Stop Loss Price and Square - fixed width container */}
        <div className="flex items-center gap-1 justify-end" style={{ minWidth: '50px' }}>
          {stopLoss && (
            <>
              <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                ${stopLoss.toFixed(0)}
              </span>
              <StopSquare color={stopColor} />
            </>
          )}
          {!stopLoss && <div className="w-[9px]" />} {/* Placeholder if no stop */}
        </div>

        {/* Fixed width container for entry price */}
        <div className="flex items-center justify-center" style={{ width: `${CONFIG.containerWidth - 18}px` }}>
          {entryPrice && (
            <div className="flex items-center gap-1">
              <PlaySymbol color={targetColor} />
              <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                ${entryPrice.toFixed(0)}
              </span>
            </div>
          )}
        </div>

        {/* Target Price and Bullseye - fixed width container */}
        <div className="flex items-center gap-1 justify-start" style={{ minWidth: '50px' }}>
          {targetPrice ? (
            <>
              <Bullseye filled={isClosedPosition} color={targetColor} />
              <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                ${targetPrice.toFixed(0)}
              </span>
            </>
          ) : (
            <>
              <div className="w-[9px] h-[9px]" /> {/* Placeholder for bullseye width */}
              <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                –
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Export unified component (no more duplicate)
export const ClosedPositionStatusBar = PositionStatusBar;