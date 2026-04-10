"use client";

import { useState, useEffect } from "react";
import { MetricCard, MetricCardSkeleton } from "@/components/ui/MetricCard";
import { formatCurrency, formatNumber, calcPercentChange } from "@/lib/utils";
import { DollarSign, ShoppingCart, Cpu, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types";

type Range = "today" | "week" | "month";

export function DashboardMetrics() {
  const [range, setRange] = useState<Range>("today");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/stats?range=${range}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [range]);

  const ranges: { key: Range; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "7 Days" },
    { key: "month", label: "30 Days" },
  ];

  return (
    <div>
      {/* Range toggle */}
      <div className="flex items-center gap-1 mb-4 bg-white rounded-lg p-1 w-fit shadow-card">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
              range === r.key
                ? "bg-accent text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              label="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              change={stats.revenueChange}
              changeLabel="vs prev period"
              accent
              icon={<DollarSign className="w-3.5 h-3.5 text-accent" />}
            />
            <MetricCard
              label="Total Transactions"
              value={formatNumber(stats.totalTransactions)}
              change={stats.transactionChange}
              changeLabel="vs prev period"
              icon={<ShoppingCart className="w-3.5 h-3.5 text-text-tertiary" />}
            />
            <MetricCard
              label="Active Machines"
              value={`${stats.activeMachines} / ${stats.totalMachines}`}
              icon={<Cpu className="w-3.5 h-3.5 text-text-tertiary" />}
            />
            <MetricCard
              label="Avg Rev / Machine"
              value={formatCurrency(stats.avgRevenuePerMachine)}
              icon={<TrendingUp className="w-3.5 h-3.5 text-text-tertiary" />}
            />
          </>
        )}
      </div>
    </div>
  );
}
