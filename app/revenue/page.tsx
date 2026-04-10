"use client";

import { useState, useEffect, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader } from "@/components/ui/Card";
import { MetricCard, MetricCardSkeleton } from "@/components/ui/MetricCard";
import { RevenueLineChart } from "@/components/charts/RevenueLineChart";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { format, subDays, parseISO } from "date-fns";
import { Download, DollarSign, TrendingUp, ShoppingCart, BarChart2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import type { RevenueStats } from "@/types";

type Preset = "1d" | "7d" | "30d" | "90d";

const CATEGORY_COLORS = [
  "#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function RevenuePage() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  const fetchData = useCallback((start: string, end: string) => {
    setLoading(true);
    fetch(`/api/revenue?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const end = new Date();
    const days = preset === "1d" ? 1 : preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
    const start = subDays(end, days);
    const s = format(start, "yyyy-MM-dd");
    const e = format(end, "yyyy-MM-dd");
    setStartDate(s);
    setEndDate(e);
    fetchData(s, e);
  }, [preset, fetchData]);

  function applyCustomRange() {
    if (startDate && endDate) fetchData(startDate, endDate);
  }

  function exportCSV() {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", data.totalRevenue],
      ["Total Profit", data.totalProfit],
      ["Avg Transaction Value", data.avgTransactionValue],
      ["Total Transactions", data.totalTransactions],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxHeatmapRevenue = data?.heatmap.reduce((max, h) => Math.max(max, h.revenue), 0) ?? 1;

  return (
    <>
      <TopBar title="Revenue" />
      <main className="flex-1 p-6 space-y-5">
        {/* Date controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-card">
            {(["1d", "7d", "30d", "90d"] as Preset[]).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  preset === p ? "bg-accent text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 px-3 text-xs bg-white border border-gray-200 rounded-lg text-text-primary outline-none focus:border-accent transition-colors"
            />
            <span className="text-xs text-text-tertiary">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 px-3 text-xs bg-white border border-gray-200 rounded-lg text-text-primary outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={applyCustomRange}
              className="h-8 px-3 text-xs font-medium bg-accent text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
          <button
            onClick={exportCSV}
            className="ml-auto flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-white border border-gray-200 rounded-lg text-text-secondary hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {loading || !data ? (
            Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
          ) : (
            <>
              <MetricCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} accent icon={<DollarSign className="w-3.5 h-3.5 text-accent" />} />
              <MetricCard label="Total Profit" value={formatCurrency(data.totalProfit)} icon={<TrendingUp className="w-3.5 h-3.5 text-text-tertiary" />} />
              <MetricCard label="Avg Transaction" value={formatCurrency(data.avgTransactionValue)} icon={<BarChart2 className="w-3.5 h-3.5 text-text-tertiary" />} />
              <MetricCard label="Transactions" value={formatNumber(data.totalTransactions)} icon={<ShoppingCart className="w-3.5 h-3.5 text-text-tertiary" />} />
            </>
          )}
        </div>

        {/* Revenue trend */}
        <Card>
          <CardHeader
            title="Revenue Over Time"
            action={
              <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  className="w-3.5 h-3.5 accent-accent"
                />
                Compare to previous period
              </label>
            }
          />
          {loading || !data ? (
            <div className="h-56 animate-pulse bg-gray-50 rounded-lg" />
          ) : (
            <RevenueLineChart
              data={data.trend}
              prevData={showComparison ? data.prevTrend : undefined}
              height={224}
            />
          )}
        </Card>

        {/* Machine ranking + Category breakdown */}
        <div className="grid grid-cols-2 gap-5">
          {/* By machine */}
          <Card>
            <CardHeader title="Revenue by Machine" subtitle="Sorted by total revenue" />
            {loading || !data ? (
              <div className="h-48 animate-pulse bg-gray-50 rounded-lg" />
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                {data.revenueByMachine.slice(0, 10).map((m, i) => {
                  const max = data.revenueByMachine[0]?.revenue ?? 1;
                  return (
                    <div key={m.machineId} className="flex items-center gap-2">
                      <span className="text-xs text-text-tertiary w-4 font-mono-data">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-xs font-medium text-text-primary truncate">{m.machineName}</span>
                          <span className="text-xs font-mono-data text-text-primary ml-2">{formatCurrency(m.revenue)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${(m.revenue / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* By category */}
          <Card>
            <CardHeader title="Revenue by Category" />
            {loading || !data ? (
              <div className="h-48 animate-pulse bg-gray-50 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.revenueByCategory}
                    dataKey="revenue"
                    nameKey="category"
                    cx="40%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={48}
                    strokeWidth={0}
                  >
                    {data.revenueByCategory.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 11, color: "#6B7280" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Heatmap */}
        <Card>
          <CardHeader title="Sales Heatmap" subtitle="Revenue by hour and day of week" />
          {loading || !data ? (
            <div className="h-48 animate-pulse bg-gray-50 rounded-lg" />
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Day labels */}
                <div className="flex gap-1 mb-1 pl-10">
                  {DAYS.map((d) => (
                    <div key={d} className="flex-1 text-center text-xs text-text-tertiary">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Hours */}
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="flex items-center gap-1 mb-0.5">
                    <div className="w-9 text-right text-xs text-text-tertiary pr-1">
                      {hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`}
                    </div>
                    {Array.from({ length: 7 }, (_, day) => {
                      const cell = data.heatmap.find((h) => h.hour === hour && h.day === day);
                      const rev = cell?.revenue ?? 0;
                      const intensity = maxHeatmapRevenue > 0 ? rev / maxHeatmapRevenue : 0;
                      return (
                        <div
                          key={day}
                          className="flex-1 h-5 rounded-sm transition-opacity"
                          style={{
                            backgroundColor: `rgba(37, 99, 235, ${0.08 + intensity * 0.92})`,
                          }}
                          title={`${DAYS[day]} ${hour}:00 — ${formatCurrency(rev)}`}
                        />
                      );
                    })}
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-3 justify-end">
                  <span className="text-xs text-text-tertiary">Low</span>
                  <div className="flex gap-0.5">
                    {[0.08, 0.3, 0.5, 0.7, 1.0].map((o) => (
                      <div key={o} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(37, 99, 235, ${o})` }} />
                    ))}
                  </div>
                  <span className="text-xs text-text-tertiary">High</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
