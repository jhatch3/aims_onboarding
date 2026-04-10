import { cn } from "@/lib/utils";

interface StockBarProps {
  pct: number;
  showLabel?: boolean;
  className?: string;
}

export function StockBar({ pct, showLabel = false, className }: StockBarProps) {
  const clampedPct = Math.min(100, Math.max(0, pct));

  const barColor =
    clampedPct < 10
      ? "bg-danger"
      : clampedPct < 25
      ? "bg-warning"
      : "bg-success";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", barColor)}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-text-secondary w-8 text-right font-mono-data">
          {Math.round(clampedPct)}%
        </span>
      )}
    </div>
  );
}
