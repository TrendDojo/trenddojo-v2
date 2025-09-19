"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// UNIFIED CONFIGURATION - Single source of truth for all visual parameters
// ============================================================================
const POSITION_VISUAL_CONFIG = {
  // Container dimensions
  totalWidth: 120,           // Total width of the visualization
  containerHeight: 40,        // Total height including indicators

  // Segment dimensions
  segmentHeight: 8,          // Height of position segments (h-2 in tailwind)
  segmentGap: 3,             // Gap between segments
  minStopLossWidth: 15,      // Minimum width for stop loss segment
  minSegmentWidth: 8,        // Minimum width for other segments
  stopLossRatio: 0.25,       // Default proportion for stop loss in simple positions

  // Indicator dimensions
  indicatorDotSize: 8,        // Width/height of indicator dots (w-2 h-2)
  indicatorStickWidth: 2,     // Width of indicator stick (w-0.5)
  indicatorStickHeight: 12,   // Height of indicator stick (h-3)

  // Positioning
  segmentTop: 8,             // Top position for segments (top-2)
  indicatorBottom: -4,       // Bottom position for indicators (-bottom-1)
  labelBottom: -9,           // Bottom position for price labels (3px higher than -12)

  // Target indicator positioning
  targetOffset: 8,           // Offset from total width for target indicator
  targetLabelOffset: 20,     // Offset for target price label
  emDashOffset: 16,          // Offset for em dash when no target

  // Label positioning
  stopLossLabelLeft: -40,    // Left offset for stop loss label
  currentPriceLabelOffset: 35, // Offset for current price label when on left
  currentPriceLabelGap: 10,   // Gap for current price label when on right
  standardLabelGap: 5,        // Standard gap between indicators and labels

  // Entry disc
  entryDiscSize: 8,          // Size of entry point disc (w-2 h-2)
  entryDiscSizePending: 12,  // Larger size for pending positions (w-3 h-3)
};

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

// Reusable current price indicator component (bottom row)
const CurrentPriceIndicator = ({ position, price, totalWidth }: { position: number; price: number; totalWidth: number }) => {
  const config = POSITION_VISUAL_CONFIG;
  // If indicator is more than 50% across, put label on left, otherwise on right
  const labelOnLeft = position > totalWidth * 0.5;

  return (
    <>
      {/* Circle indicator and vertical line at bottom */}
      <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
        style={{ left: `${position - 4}px` }}
        title={`Current Price: $${price.toFixed(2)}`}
      >
        <div className="w-2 h-2 rounded-full border-2 border-indigo-600 dark:border-indigo-500 bg-transparent" />
        <div className="w-0.5 h-3 bg-indigo-600 dark:bg-indigo-500" />
      </div>

      {/* Current price label */}
      <span className={cn(
        "absolute text-[12px] text-indigo-600 dark:text-indigo-500 font-medium",
        labelOnLeft && "text-right"
      )}
        style={{
          bottom: `${config.labelBottom}px`,
          ...(labelOnLeft
            ? { right: `${config.totalWidth - position + config.standardLabelGap}px` }
            : { left: `${position + config.standardLabelGap}px` })
        }}>
        ${price.toFixed(0)}
      </span>
    </>
  );
};

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
  const config = POSITION_VISUAL_CONFIG;

  // Calculate price-based positioning
  // For longs: range is from stopLoss (left) to highest target (right)
  // For shorts: range is from stopLoss (left) to lowest target (right)
  const calculatePricePosition = (price: number, baseWidth: number = config.totalWidth): number => {
    if (!entryPrice || !stopLoss) return 0;

    // Find the furthest target price
    let maxTargetPrice = targetPrice; // Use targetPrice prop if available

    if (scalingLevels && scalingLevels.length > 0) {
      // For scaling positions, use the furthest target
      const targets = scalingLevels.map(l => l.targetPrice);
      if (targetPrice) {
        maxTargetPrice = side === "long"
          ? Math.max(...targets, targetPrice)
          : Math.min(...targets, targetPrice);
      } else {
        maxTargetPrice = side === "long"
          ? Math.max(...targets)
          : Math.min(...targets);
      }
    }

    // If no target price available, use current price or entry price as the right edge
    if (!maxTargetPrice) {
      maxTargetPrice = currentPrice || entryPrice;
    }

    // Calculate the full price range
    const priceRange = Math.abs(maxTargetPrice - stopLoss);
    if (priceRange === 0) return 0;

    // Calculate position as ratio within the range
    // For longs: price increases from stop loss to target (left to right)
    // For shorts: price decreases from stop loss to target (but we still show left to right)
    let ratio: number;
    if (side === "long") {
      // Long position: stop loss is lower, target is higher
      const priceFromStop = price - stopLoss;
      ratio = priceFromStop / priceRange;
    } else {
      // Short position: stop loss is higher, target is lower
      // We need to invert: as price goes down, position moves right
      const priceFromStop = stopLoss - price;
      ratio = priceFromStop / priceRange;
    }

    // Convert to pixel position within the provided base width
    return Math.max(0, Math.min(baseWidth, ratio * baseWidth));
  };

  // UNIFIED RENDERING APPROACH - Works for both simple and scaling positions
  // Prepare segments array regardless of position type
  const segments: Array<{
    width: number;
    isStopLoss?: boolean;
    executed?: boolean;
    quantity: number;
    targetPrice?: number;
    executedPrice?: number;
    isSold?: boolean;
  }> = [];

  // Determine if we have scaling levels or simple position
  const hasScalingLevels = scalingLevels && scalingLevels.length > 0;
  const hasPartialSale = quantity < originalQuantity && !hasScalingLevels;

  // Calculate total gaps needed
  const totalSegments = hasScalingLevels
    ? scalingLevels.length + 1  // +1 for stop loss
    : hasPartialSale ? 3 : 2;   // stop loss + sold + remaining OR stop loss + position

  const totalGaps = config.segmentGap * (totalSegments - (hasScalingLevels ? 1 : 0));
  const availableWidth = config.totalWidth - totalGaps;

  if (hasScalingLevels) {
    // Fixed proportions based on quantity ratios
    const stopLossQuantity = quantity - scalingLevels.filter(l => !l.executed).reduce((sum, l) => sum + l.quantity, 0);

    // Calculate raw proportional widths for scaling levels
    const rawSegments = [
      {
        isStopLoss: true,
        rawWidth: (stopLossQuantity / originalQuantity) * availableWidth,
        quantity: stopLossQuantity
      },
      ...scalingLevels.map(level => ({
        ...level,
        rawWidth: (level.quantity / originalQuantity) * availableWidth
      }))
    ];

    // Apply minimum widths and redistribute
    let totalMinWidthNeeded = 0;
    rawSegments.forEach((seg, idx) => {
      const width = idx === 0
        ? Math.max(config.minStopLossWidth, seg.rawWidth)
        : Math.max(config.minSegmentWidth, seg.rawWidth);
      totalMinWidthNeeded += width;
      segments.push({ ...seg, width });
    });

    // Scale down if needed
    if (totalMinWidthNeeded > availableWidth) {
      const scaleFactor = availableWidth / totalMinWidthNeeded;
      segments.forEach(seg => {
        seg.width = seg.width * scaleFactor;
      });
    }
  } else {
    // Simple position (with or without partial sale)
    const stopLossSegmentWidth = Math.max(config.minStopLossWidth, availableWidth * config.stopLossRatio);
    const positionSegmentWidth = availableWidth - stopLossSegmentWidth;

    // Add stop loss segment
    segments.push({
      isStopLoss: true,
      width: stopLossSegmentWidth,
      quantity: 0
    });

    if (hasPartialSale) {
      const soldPercent = (originalQuantity - quantity) / originalQuantity;
      const soldPixels = soldPercent * positionSegmentWidth;
      const remainingPixels = positionSegmentWidth - soldPixels;

      // Add sold segment
      if (soldPixels > 0) {
        segments.push({
          isSold: true,
          width: soldPixels,
          quantity: originalQuantity - quantity,
          executed: true
        });
      }

      // Add remaining segment
      if (remainingPixels > 0) {
        segments.push({
          width: remainingPixels,
          quantity: quantity
        });
      }
    } else {
      // Single position segment
      segments.push({
        width: positionSegmentWidth,
        quantity: quantity
      });
    }
  }

  // Calculate indicator positions using price-based positioning
  const entryPosition = entryPrice ? calculatePricePosition(entryPrice) : config.totalWidth * 0.5;
  // For pending positions, always show current price at entry position
  const currentPosition = status === "pending"
    ? entryPosition
    : (currentPrice ? calculatePricePosition(currentPrice) : entryPosition);

  // Determine final target for indicators
  const finalTarget = targetPrice || scalingLevels?.[scalingLevels.length - 1]?.targetPrice;

  return (
    <div className="relative inline-block" style={{ width: `${config.totalWidth}px`, height: `${config.containerHeight}px` }}>

      {/* Middle row: Position segments */}
      <div className="absolute flex items-center" style={{ top: `${config.segmentTop}px`, gap: `${config.segmentGap}px` }}>
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;
          const shouldRemoveRightBorder = !finalTarget && isLast && !seg.isStopLoss;

          return (
            <React.Fragment key={idx}>
              <div
                className={cn(
                  "h-2 cursor-help",
                  seg.isStopLoss
                    ? "rounded-full border"
                    : seg.isSold
                      ? "rounded-full bg-up"
                      : shouldRemoveRightBorder
                        ? "rounded-l-full border-t border-b border-l border-r-0"
                        : seg.executed
                          ? "rounded-full"
                          : "rounded-full border",
                  // Color logic
                  seg.isStopLoss
                    ? side === "short" ? "border-up" : "border-down"
                    : seg.isSold
                      ? "bg-up !border-0"
                      : seg.executed
                        ? side === "short" ? "bg-down !border-0" : "bg-up !border-0"
                        : side === "short" ? "border-down" : "border-up"
                )}
                style={{ width: `${seg.width}px` }}
                title={
                  seg.isStopLoss
                    ? `Stop Loss @ $${stopLoss || 'Not set'}`
                    : seg.isSold
                      ? `Sold: ${seg.quantity} shares`
                      : seg.executed
                        ? `✓ Sold ${seg.quantity} @ $${seg.executedPrice}`
                        : seg.targetPrice
                          ? `Target: ${seg.quantity} @ $${seg.targetPrice}`
                          : `Position: ${seg.quantity} shares`
                }
              />
              {/* Add entry disc after stop loss segment */}
              {seg.isStopLoss && entryPrice && (
                <div
                  className={cn(
                    "rounded-full",
                    status === "pending"
                      ? "w-3 h-3 border-2 border-gray-800 dark:border-gray-300"
                      : "w-2 h-2 bg-gray-800 dark:bg-gray-300"
                  )}
                  title={`Entry @ $${entryPrice}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom row: Stop loss, current price, and target indicators */}
      {stopLoss && (
        <>
          <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
            style={{ left: `${config.indicatorBottom}px` }}
            title={`Stop Loss @ $${stopLoss}`}
          >
            <div className={cn(
              "w-2 h-2 -ml-px",
              side === "short" ? "bg-up" : "bg-down"
            )} />
            <div className={cn(
              "w-0.5 h-3",
              side === "short" ? "bg-up" : "bg-down"
            )} />
          </div>
          {/* Stop loss price label */}
          <span className={cn(
            "absolute text-[12px] text-right",
            side === "short" ? "text-up" : "text-down"
          )}
            style={{ bottom: `${config.labelBottom}px`, right: `${config.totalWidth + config.standardLabelGap}px` }}>
            ${stopLoss.toFixed(0)}
          </span>
        </>
      )}

      {/* Current Price Indicator on bottom row - only show for active positions */}
      {currentPrice && status !== "pending" && <CurrentPriceIndicator position={currentPosition} price={currentPrice} totalWidth={config.totalWidth} />}

      {/* For pending positions, show price label under entry point */}
      {status === "pending" && currentPrice && (
        <span className="absolute text-[12px] text-gray-700 dark:text-gray-400"
          style={{
            bottom: `${config.labelBottom}px`,
            left: `${entryPosition + config.standardLabelGap}px`
          }}>
          ${currentPrice.toFixed(0)}
        </span>
      )}

      {/* Target section */}
      {finalTarget ? (
        <>
          <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
            style={{ left: `${config.totalWidth + config.targetOffset}px` }}
            title={`Target @ $${finalTarget}`}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              side === "long" ? "bg-up" : "bg-down"
            )} />
            <div className={cn(
              "w-0.5 h-3",
              side === "long" ? "bg-up" : "bg-down"
            )} />
          </div>
          {/* Target price label */}
          <span className={cn(
            "absolute text-[12px]",
            side === "long" ? "text-up" : "text-down"
          )}
            style={{ bottom: `${config.labelBottom}px`, left: `${config.totalWidth + config.standardLabelGap}px` }}>
            ${finalTarget.toFixed(0)}
          </span>
        </>
      ) : (
        // No target - show em dash
        <span className={cn(
          "absolute text-[12px]",
          side === "long" ? "text-up" : "text-down"
        )}
          style={{ bottom: `${config.labelBottom}px`, left: `${config.totalWidth + config.standardLabelGap}px` }}>
          —
        </span>
      )}
    </div>
  );
}


// Special variant for closed positions
export function ClosedPositionStatusBar({
  side,
  quantity,
  originalQuantity,
  entryPrice,
  currentPrice,
  stopLoss,
  targetPrice,
  scalingLevels,
  exitReason,
  pnl = 0
}: PositionStatusBarProps) {
  const config = POSITION_VISUAL_CONFIG;

  // Calculate position for entry and exit points
  const calculatePricePosition = (price: number, baseWidth: number = config.totalWidth): number => {
    if (!entryPrice || !stopLoss) return 0;

    // Determine the range based on available prices
    let maxTargetPrice = targetPrice;
    if (scalingLevels && scalingLevels.length > 0) {
      const targets = scalingLevels.map(l => l.targetPrice);
      maxTargetPrice = side === "long"
        ? Math.max(...targets, targetPrice || 0)
        : Math.min(...targets, targetPrice || Infinity);
    }

    if (!maxTargetPrice) {
      maxTargetPrice = currentPrice || entryPrice;
    }

    const priceRange = Math.abs(maxTargetPrice - stopLoss);
    if (priceRange === 0) return 0;

    let ratio: number;
    if (side === "long") {
      const priceFromStop = price - stopLoss;
      ratio = priceFromStop / priceRange;
    } else {
      const priceFromStop = stopLoss - price;
      ratio = priceFromStop / priceRange;
    }

    return Math.max(0, Math.min(baseWidth, ratio * baseWidth));
  };

  const entryPosition = entryPrice ? calculatePricePosition(entryPrice) : config.totalWidth * 0.5;

  // Calculate exit price based on exit reason
  let exitPrice: number | undefined;
  if (exitReason === "stop_loss" && stopLoss) {
    exitPrice = stopLoss;
  } else if (exitReason === "take_profit" && targetPrice) {
    exitPrice = targetPrice;
  } else if (currentPrice) {
    exitPrice = currentPrice;
  } else if (pnl !== 0 && entryPrice) {
    // Try to calculate exit price from P&L if not provided
    // This is approximate and should ideally come from data
    const pnlPercent = pnl / (entryPrice * originalQuantity);
    exitPrice = side === "long"
      ? entryPrice * (1 + pnlPercent)
      : entryPrice * (1 - pnlPercent);
  }

  const exitPosition = exitReason === "stop_loss" && stopLoss
    ? 0  // Stop loss is always at position 0
    : (exitPrice ? calculatePricePosition(exitPrice) : config.totalWidth);

  // For closed positions with scaling
  if (scalingLevels && scalingLevels.length > 0) {
    const executedCount = scalingLevels.filter(l => l.executed).length;
    const unexecutedCount = scalingLevels.filter(l => !l.executed).length;

    // Calculate width differently based on exit reason
    let segmentWidth: number;
    if (exitReason === "stop_loss") {
      // With stop loss: stop loss + entry disc + scaling levels
      const totalSegments = scalingLevels.length + 1; // +1 for stop loss
      const totalGaps = config.segmentGap * (totalSegments + 1); // +1 for entry disc
      const availableWidth = config.totalWidth - totalGaps - config.entryDiscSize;
      segmentWidth = availableWidth / totalSegments;
    } else {
      // Without stop loss: entry disc + scaling levels
      const totalSegments = scalingLevels.length;
      const totalGaps = config.segmentGap * totalSegments; // gaps between entry disc and segments
      const availableWidth = config.totalWidth - totalGaps - config.entryDiscSize;
      segmentWidth = availableWidth / totalSegments;
    }

    // Calculate the actual position of the entry disc
    // For stop loss exits: after stop loss segment + gap
    // For successful exits: at the beginning
    const entryDiscPosition = exitReason === "stop_loss"
      ? config.minStopLossWidth + config.segmentGap
      : 0;

    return (
      <div className="relative inline-block" style={{ width: `${config.totalWidth}px`, height: `${config.containerHeight}px` }}>
        {/* Middle row: segments */}
        <div className="absolute flex items-center" style={{ top: `${config.segmentTop}px`, gap: `${config.segmentGap}px` }}>
          {/* Stop loss segment - only show if position was stopped out */}
          {exitReason === "stop_loss" && (
            <div
              className="h-2 rounded-full cursor-help bg-down"
              style={{ width: `${config.minStopLossWidth}px` }}
              title="Stop loss hit"
            />
          )}

          {/* Entry disc */}
          <div
            className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-300"
            title={`Entry @ $${entryPrice}`}
          />

          {/* Executed profit segments */}
          {scalingLevels.filter(l => l.executed).map((level, idx) => (
            <div
              key={idx}
              className={cn(
                "h-2 rounded-full cursor-help",
                side === "long" ? "bg-up" : "bg-down"
              )}
              style={{ width: `${segmentWidth}px` }}
              title={`Executed: ${level.quantity} @ $${level.executedPrice}`}
            />
          ))}

          {/* Unexecuted segments - lighter grey background */}
          {scalingLevels.filter(l => !l.executed).map((level, idx) => (
            <div
              key={`unex-${idx}`}
              className="h-2 rounded-full bg-gray-300 dark:bg-gray-700 cursor-help"
              style={{ width: `${segmentWidth}px` }}
              title={`Not executed: ${level.quantity} @ $${level.targetPrice}`}
            />
          ))}
        </div>

        {/* Entry price indicator and label - positioned under the entry disc */}
        {entryPrice && (
          <>
            <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
              style={{ left: `${entryDiscPosition}px` }}
              title={`Entry @ $${entryPrice}`}
            >
              <div className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-300" />
              <div className="w-0.5 h-3 bg-gray-800 dark:bg-gray-300" />
            </div>
            {/* Only move entry price left for winning positions */}
            {exitReason !== "stop_loss" && pnl >= 0 ? (
              <span className="absolute text-[12px] text-gray-700 dark:text-gray-400 text-right"
                style={{
                  bottom: `${config.labelBottom}px`,
                  right: `${config.totalWidth - entryDiscPosition + config.standardLabelGap}px`
                }}>
                ${entryPrice.toFixed(0)}
              </span>
            ) : (
              <span className="absolute text-[12px] text-gray-700 dark:text-gray-400"
                style={{
                  bottom: `${config.labelBottom}px`,
                  left: `${entryDiscPosition + config.standardLabelGap}px`
                }}>
                ${entryPrice.toFixed(0)}
              </span>
            )}
          </>
        )}

        {/* Exit indicator */}
        {exitPrice && exitPrice !== entryPrice && (
          <>
            {(() => {
              // Calculate position of exit indicator
              let exitIndicatorPosition: number;
              if (exitReason === "stop_loss") {
                exitIndicatorPosition = -4;
              } else {
                // For successful exits, position at end of last executed segment
                const executedSegments = scalingLevels.filter(l => l.executed).length;
                if (executedSegments > 0) {
                  // Position after entry disc + executed segments + gaps
                  exitIndicatorPosition = config.entryDiscSize + config.segmentGap +
                    (executedSegments * segmentWidth) +
                    ((executedSegments - 1) * config.segmentGap) - 4;
                } else {
                  // No executed segments, use full width
                  exitIndicatorPosition = config.totalWidth - 4;
                }
              }

              return (
                <>
                  <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
                    style={{ left: `${exitIndicatorPosition}px` }}
                    title={`${exitReason === "stop_loss" ? "Stopped out" : "Exit"} @ $${exitPrice}`}
                  >
                    <div className={cn(
                      "w-2 h-2",
                      exitReason === "stop_loss" ? "bg-down" : (side === "short" ? "bg-down" : "bg-up")
                    )} />
                    <div className={cn(
                      "w-0.5 h-3",
                      exitReason === "stop_loss" ? "bg-down" : (side === "short" ? "bg-down" : "bg-up")
                    )} />
                  </div>
                  <span className={cn(
                    "absolute text-[12px]",
                    exitReason === "stop_loss" ? "text-down text-right" : (side === "short" ? "text-down" : "text-up")
                  )}
                    style={{
                      bottom: `${config.labelBottom}px`,
                      ...(exitReason === "stop_loss"
                        ? { right: `${config.totalWidth + config.standardLabelGap}px` }  // Text on left, right-aligned
                        : { left: `${exitIndicatorPosition + config.standardLabelGap}px` })  // Text on right, left-aligned
                    }}>
                    ${exitPrice.toFixed(0)}
                  </span>
                </>
              );
            })()}
          </>
        )}

      </div>
    );
  }

  // Simple closed position
  // Calculate the actual position of the entry disc
  // For stop loss exits: after stop loss segment + gap
  // For successful exits: at the beginning
  const entryDiscPosition = exitReason === "stop_loss"
    ? config.minStopLossWidth + config.segmentGap
    : 0;

  return (
    <div className="relative inline-block" style={{ width: `${config.totalWidth}px`, height: `${config.containerHeight}px` }}>
      {/* Middle row */}
      <div className="absolute flex items-center" style={{ top: `${config.segmentTop}px`, gap: `${config.segmentGap}px` }}>
        {/* Stop loss segment - only show if position was stopped out */}
        {exitReason === "stop_loss" && (
          <div
            className="h-2 rounded-full cursor-help bg-down"
            style={{ width: `${config.minStopLossWidth}px` }}
            title="Stop loss hit"
          />
        )}

        {/* Entry disc */}
        <div
          className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-300"
          title={`Entry @ $${entryPrice}`}
        />

        {/* Position bar - filled based on profit/loss or incomplete if stopped */}
        {exitReason === "stop_loss" ? (
          // For stopped out positions: only show grey incomplete segment (stop loss already shows the loss)
          <div
            className="h-2 rounded-full cursor-help bg-gray-300 dark:bg-gray-700"
            style={{ width: `${config.totalWidth - config.minStopLossWidth - config.entryDiscSize - config.segmentGap * 2}px` }}
            title="Target not reached"
          />
        ) : (
          // For profit/manual exits: single filled segment with direction-based color (no stop loss segment)
          <div
            className={cn(
              "h-2 rounded-full cursor-help",
              pnl >= 0
                ? (side === "long" ? "bg-up" : "bg-down")  // Profit: green for long, red for short
                : "bg-down"  // Loss: always red
            )}
            style={{ width: `${config.totalWidth - config.entryDiscSize - config.segmentGap}px` }}
            title={`Closed: ${pnl >= 0 ? 'Profit' : 'Loss'} $${Math.abs(pnl).toFixed(2)}`}
          />
        )}
      </div>

      {/* Entry price indicator and label - positioned under the entry disc */}
      {entryPrice && (
        <>
          <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
            style={{ left: `${entryDiscPosition}px` }}
            title={`Entry @ $${entryPrice}`}
          >
            <div className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-300" />
            <div className="w-0.5 h-3 bg-gray-800 dark:bg-gray-300" />
          </div>
          {/* Only move entry price left for winning positions */}
          {exitReason !== "stop_loss" && pnl >= 0 ? (
            <span className="absolute text-[12px] text-gray-700 dark:text-gray-400 text-right"
              style={{
                bottom: `${config.labelBottom}px`,
                right: `${config.totalWidth - entryDiscPosition + config.standardLabelGap}px`
              }}>
              ${entryPrice.toFixed(0)}
            </span>
          ) : (
            <span className="absolute text-[12px] text-gray-700 dark:text-gray-400"
              style={{
                bottom: `${config.labelBottom}px`,
                left: `${entryDiscPosition + config.standardLabelGap}px`
              }}>
              ${entryPrice.toFixed(0)}
            </span>
          )}
        </>
      )}

      {/* Exit/Close indicator - positioned based on where the position closed */}
      {exitPrice && exitPrice !== entryPrice && (
        <>
          <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
            style={{ left: `${exitReason === "stop_loss" ? -4 : config.totalWidth - 4}px` }}
            title={`${exitReason === "stop_loss" ? "Stopped out" : "Closed"} @ $${exitPrice}`}
          >
            <div className={cn(
              "w-2 h-2",
              exitReason === "stop_loss" ? "bg-down" : (side === "short" ? "bg-down" : "bg-up")
            )} />
            <div className={cn(
              "w-0.5 h-3",
              exitReason === "stop_loss" ? "bg-down" : (side === "short" ? "bg-down" : "bg-up")
            )} />
          </div>
          <span className={cn(
            "absolute text-[12px]",
            exitReason === "stop_loss" ? "text-down text-right" : (side === "short" ? "text-down" : "text-up")
          )}
            style={{
              bottom: `${config.labelBottom}px`,
              ...(exitReason === "stop_loss"
                ? { right: `${config.totalWidth + config.standardLabelGap}px` }  // Text on left, right-aligned
                : { left: `${config.totalWidth + config.standardLabelGap}px` })  // Text on right, left-aligned
            }}>
            ${exitPrice.toFixed(0)}
          </span>
        </>
      )}

    </div>
  );
}