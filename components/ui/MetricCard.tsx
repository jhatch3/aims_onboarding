import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  accent = false,
  className,
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  return (
    <div
      className={cn(
        "bg-white rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200",
        accent && "border-l-2 border-accent",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</p>
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      <p className="text-2xl font-semibold text-text-primary font-mono-data tracking-tight">{value}</p>

      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive && (
            <>
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-xs font-medium text-success">+{Math.abs(change).toFixed(1)}%</span>
            </>
          )}
          {isNegative && (
            <>
              <TrendingDown className="w-3 h-3 text-danger" />
              <span className="text-xs font-medium text-danger">{change.toFixed(1)}%</span>
            </>
          )}
          {isNeutral && (
            <>
              <Minus className="w-3 h-3 text-text-tertiary" />
              <span className="text-xs font-medium text-text-tertiary">0%</span>
            </>
          )}
          {changeLabel && (
            <span className="text-xs text-text-tertiary ml-0.5">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-card animate-pulse">
      <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
      <div className="h-7 w-32 bg-gray-100 rounded mb-2" />
      <div className="h-3 w-16 bg-gray-100 rounded" />
    </div>
  );
}
