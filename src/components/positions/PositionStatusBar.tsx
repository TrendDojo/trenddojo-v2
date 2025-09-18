"use client";

import { cn } from "@/lib/utils";

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
  stopLoss?: number;
  scalingLevels?: ScalingLevel[];
  status?: "active" | "pending" | "closed";
  exitReason?: "stop_loss" | "take_profit" | "manual" | "partial";
  pnl?: number;
}

export function PositionStatusBar({
  side,
  quantity,
  originalQuantity,
  stopLoss,
  scalingLevels,
  status = "active",
  exitReason,
  pnl = 0
}: PositionStatusBarProps) {
  const totalWidth = 120; // Total width for visualization
  const gap = 3; // Consistent gap between segments

  // For positions with scaling levels
  if (scalingLevels && scalingLevels.length > 0) {
    // Always include stop loss segment + profit segments
    const totalSegments = scalingLevels.length + 1; // +1 for stop loss
    const totalGaps = gap * (totalSegments - 1);
    const availableWidth = totalWidth - totalGaps;

    // Stop loss takes remaining quantity, profit segments take their portion
    const stopLossQuantity = quantity - scalingLevels.filter(l => !l.executed).reduce((sum, l) => sum + l.quantity, 0);
    const stopLossWidth = Math.max((stopLossQuantity / originalQuantity) * availableWidth, availableWidth / totalSegments);

    // Calculate segment widths
    const segments = [
      { isStopLoss: true, width: stopLossWidth, quantity: stopLossQuantity },
      ...scalingLevels.map(level => ({
        ...level,
        width: (level.quantity / originalQuantity) * availableWidth
      }))
    ];

    // Calculate cumulative positions for indicators
    let cumulativeWidth = 0;
    const segmentPositions = segments.map((seg, idx) => {
      const pos = cumulativeWidth;
      cumulativeWidth += seg.width + (idx < segments.length - 1 ? gap : 0);
      return { ...seg, position: pos };
    });

    return (
      <div className="relative inline-block" style={{ width: `${totalWidth}px`, height: '32px' }}>
        {/* Top row: Entry and profit indicators */}
        {/* Entry indicator - positioned at first segment width + half gap */}
        <div className="absolute -top-1 flex flex-col items-center cursor-help"
          style={{ left: `${segmentPositions[0].width + gap/2 - 4}px` }}
          title="Entry point"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
          <div className="w-0.5 h-1.5 bg-blue-500 dark:bg-blue-400" />
        </div>

        {/* Profit take indicators - positioned at gaps after executed segments */}
        {segmentPositions.slice(1).map((seg, idx) => (
          seg.executed && (
            <div key={idx} className="absolute -top-1 flex flex-col items-center cursor-help"
              style={{ left: `${seg.position + seg.width + gap/2 - 4}px` }}
              title={`Sold ${seg.quantity} @ $${seg.executedPrice}`}
            >
              <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
              <div className="w-0.5 h-1.5 bg-black dark:bg-white" />
            </div>
          )
        ))}

        {/* Middle row: Position segments */}
        <div className="absolute top-3 flex items-center" style={{ gap: `${gap}px` }}>
          {segmentPositions.map((seg, idx) => (
            <div
              key={idx}
              className={cn(
                "h-2 rounded-full cursor-help",
                idx === 0 // Stop loss segment
                  ? `border ${side === "short" ? "border-green-500 dark:border-green-400" : "border-red-500 dark:border-red-400"}`
                  : seg.executed
                    ? side === "short"
                      ? "bg-black dark:bg-gray-200"
                      : "bg-up"
                    : "border border-gray-400 dark:border-gray-500"
              )}
              style={{ width: `${seg.width}px` }}
              title={
                idx === 0
                  ? `Stop Loss @ $${stopLoss || 'Not set'}`
                  : seg.executed
                    ? `✓ Sold ${seg.quantity} @ $${seg.executedPrice}`
                    : `Target: ${seg.quantity} @ $${seg.targetPrice}`
              }
            />
          ))}
        </div>

        {/* Bottom row: Stop loss indicator - at left edge of first segment */}
        {stopLoss && (
          <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
            style={{ left: `-4px` }}
            title={`Stop Loss @ $${stopLoss}`}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              side === "short"
                ? "bg-green-500 dark:bg-green-400"
                : "bg-red-500 dark:bg-red-400"
            )} />
            <div className={cn(
              "w-0.5 h-1.5",
              side === "short"
                ? "bg-green-500 dark:bg-green-400"
                : "bg-red-500 dark:bg-red-400"
            )} />
          </div>
        )}
      </div>
    );
  }

  // For simple positions (with or without partial sales)
  // Always show 2 segments: stop loss and position
  const stopLossSegmentWidth = totalWidth * 0.3; // 30% for stop loss
  const positionSegmentWidth = totalWidth * 0.7 - gap; // 70% for position minus gap

  const soldPercent = (originalQuantity - quantity) / originalQuantity;
  const soldPixels = soldPercent * positionSegmentWidth;
  const remainingPixels = positionSegmentWidth - soldPixels;

  return (
    <div className="relative inline-block" style={{ width: `${totalWidth}px`, height: '32px' }}>
      {/* Top row: Entry and sale indicators */}
      {/* Entry indicator - at first segment width + half gap */}
      <div className="absolute -top-1 flex flex-col items-center cursor-help"
        style={{ left: `${stopLossSegmentWidth + gap/2 - 4}px` }}
        title="Entry point"
      >
        <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
        <div className="w-0.5 h-1.5 bg-blue-500 dark:bg-blue-400" />
      </div>

      {/* Partial close indicator - at gap after sold portion */}
      {quantity < originalQuantity && soldPixels > 0 && (
        <div className="absolute -top-1 flex flex-col items-center cursor-help"
          style={{ left: `${stopLossSegmentWidth + gap + soldPixels + gap/2 - 4}px` }}
          title={`Sold ${originalQuantity - quantity} shares`}
        >
          <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
          <div className="w-0.5 h-1.5 bg-black dark:bg-white" />
        </div>
      )}

      {/* Middle row: Stop loss and position segments */}
      <div className="absolute top-3 flex items-center" style={{ gap: `${gap}px` }}>
        {/* Stop loss segment */}
        <div
          className={cn(
            "h-2 rounded-full cursor-help border",
            side === "short"
              ? "border-green-500 dark:border-green-400"
              : "border-red-500 dark:border-red-400"
          )}
          style={{ width: `${stopLossSegmentWidth}px` }}
          title={`Stop Loss @ $${stopLoss || 'Not set'}`}
        />

        {/* Position segment(s) */}
        {quantity < originalQuantity ? (
          <>
            {soldPixels > 0 && (
              <div
                className="h-2 rounded-full bg-up cursor-help"
                style={{ width: `${soldPixels}px` }}
                title={`Sold: ${originalQuantity - quantity} shares`}
              />
            )}
            {remainingPixels > 0 && (
              <div
                className="h-2 rounded-full border border-gray-400 dark:border-gray-500 cursor-help"
                style={{ width: `${remainingPixels}px`, marginLeft: soldPixels > 0 ? `${gap}px` : '0' }}
                title={`Remaining: ${quantity} shares`}
              />
            )}
          </>
        ) : (
          <div
            className="h-2 rounded-full border border-gray-400 dark:border-gray-500 cursor-help"
            style={{ width: `${positionSegmentWidth}px` }}
            title={`Position: ${quantity} shares`}
          />
        )}
      </div>

      {/* Bottom row: Stop loss indicator - at left edge */}
      {stopLoss && (
        <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
          style={{ left: `-4px` }}
          title={`Stop Loss @ $${stopLoss}`}
        >
          <div className={cn(
            "w-2 h-2 rounded-full",
            side === "short"
              ? "bg-green-500 dark:bg-green-400"
              : "bg-red-500 dark:bg-red-400"
          )} />
          <div className={cn(
            "w-0.5 h-1.5",
            side === "short"
              ? "bg-green-500 dark:bg-green-400"
              : "bg-red-500 dark:bg-red-400"
          )} />
        </div>
      )}
    </div>
  );
}

// Special variant for closed positions
export function ClosedPositionStatusBar({
  side,
  stopLoss,
  scalingLevels,
  exitReason,
  pnl = 0
}: PositionStatusBarProps) {
  const totalWidth = 120;
  const gap = 3;

  // For closed positions with scaling
  if (scalingLevels && scalingLevels.some(l => l.executed)) {
    const executedCount = scalingLevels.filter(l => l.executed).length;
    const segmentWidth = (totalWidth - gap * (scalingLevels.length - 1)) / scalingLevels.length;

    return (
      <div className="relative inline-block" style={{ width: `${totalWidth}px`, height: '32px' }}>
        {/* Entry indicator - positioned at first segment width + half gap */}
        <div className="absolute -top-1 flex flex-col items-center cursor-help"
          style={{ left: `${segmentWidth + gap/2 - 4}px` }}
          title="Entry point"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
          <div className="w-0.5 h-1.5 bg-blue-500 dark:bg-blue-400" />
        </div>

        {/* Profit indicators for each executed level */}
        {scalingLevels.map((level, idx) => (
          level.executed && (
            <div key={idx} className="absolute -top-1 flex flex-col items-center cursor-help"
              style={{ left: `${idx * (segmentWidth + gap) + segmentWidth / 2 - 4}px` }}
              title={`Sold ${level.quantity} @ $${level.executedPrice}`}
            >
              <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
              <div className="w-0.5 h-1.5 bg-black dark:bg-white" />
            </div>
          )
        ))}

        {/* Middle row: segments */}
        <div className="absolute top-3 flex items-center" style={{ gap: `${gap}px` }}>
          {/* Stop loss if hit */}
          {exitReason === "stop_loss" && (
            <div
              className="h-2 rounded-full bg-down cursor-help"
              style={{ width: '15px' }}
              title="Stop loss hit"
            />
          )}
          {/* Executed segments */}
          {scalingLevels.filter(l => l.executed).map((_, idx) => (
            <div
              key={idx}
              className="h-2 rounded-full bg-up cursor-help"
              style={{ width: `${segmentWidth}px` }}
              title={`Profit take ${idx + 1}`}
            />
          ))}
          {/* Unexecuted segments */}
          {scalingLevels.filter(l => !l.executed).map((_, idx) => (
            <div
              key={`unex-${idx}`}
              className="h-2 rounded-full bg-gray-500 dark:bg-gray-600 cursor-help"
              style={{ width: `${segmentWidth}px` }}
              title={`Missed target ${idx + 1}`}
            />
          ))}
        </div>

        {/* Stop loss indicator if not hit */}
        {stopLoss && exitReason !== "stop_loss" && (
          <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
            style={{ left: '-4px' }}
            title={`Stop Loss @ $${stopLoss} (not hit)`}
          >
            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
            <div className="w-0.5 h-1.5 bg-gray-400 dark:bg-gray-500" />
          </div>
        )}

        {/* Profit/loss indicator text */}
        <span className={cn(
          "absolute right-0 top-3 text-xs font-semibold ml-2",
          pnl >= 0 ? "text-up" : "text-down"
        )}>
          {executedCount}×
        </span>
      </div>
    );
  }

  // Simple closed position
  return (
    <div className="relative inline-block" style={{ width: `${totalWidth}px`, height: '32px' }}>
      {/* Entry indicator */}
      <div className="absolute -top-1 flex flex-col items-center cursor-help"
        style={{ left: `${totalWidth / 2 - 4}px` }}
        title="Entry point"
      >
        <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
        <div className="w-0.5 h-1.5 bg-blue-500 dark:bg-blue-400" />
      </div>

      {/* Middle row */}
      <div className="absolute top-3 flex items-center gap-1">
        {/* Stop loss if hit */}
        {exitReason === "stop_loss" && (
          <div
            className="h-2 rounded-full bg-down cursor-help"
            style={{ width: '15px' }}
            title="Stop loss hit"
          />
        )}
        {/* Position bar */}
        <div
          className={cn(
            "h-2 rounded-full cursor-help",
            pnl >= 0 ? "bg-up" : "bg-down"
          )}
          style={{ width: exitReason === "stop_loss" ? `${totalWidth - 15 - gap}px` : `${totalWidth}px` }}
          title={`Closed: ${pnl >= 0 ? 'Profit' : 'Loss'}`}
        />
      </div>

      {/* Stop loss indicator if not hit */}
      {stopLoss && exitReason !== "stop_loss" && (
        <div className="absolute -bottom-1 flex flex-col-reverse items-center cursor-help"
          style={{ left: '-4px' }}
          title={`Stop Loss @ $${stopLoss} (not hit)`}
        >
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
          <div className="w-0.5 h-1.5 bg-gray-400 dark:bg-gray-500" />
        </div>
      )}

      {/* Profit/loss text */}
      <span className={cn(
        "absolute right-0 top-3 text-xs font-semibold ml-2",
        pnl >= 0 ? "text-up" : "text-down"
      )}>
        {pnl >= 0 ? "Profit" : "Loss"}
      </span>
    </div>
  );
}