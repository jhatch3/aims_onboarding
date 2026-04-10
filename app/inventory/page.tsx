"use client";

import { useState, useEffect, useMemo } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatRelativeTime } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import type { InventoryRow } from "@/types";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [machineFilter, setMachineFilter] = useState("all");

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((d) => {
        setRows(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const critical = useMemo(() => rows.filter((r) => r.stockPct < 10), [rows]);
  const warning = useMemo(() => rows.filter((r) => r.stockPct >= 10 && r.stockPct < 25), [rows]);

  const machines = useMemo(() => {
    const names = new Map<string, string>();
    rows.forEach((r) => names.set(r.machineId, r.machineName));
    return [{ id: "all", name: "All Machines" }, ...Array.from(names.entries()).map(([id, name]) => ({ id, name }))];
  }, [rows]);

  const filtered = useMemo(() =>
    machineFilter === "all" ? rows : rows.filter((r) => r.machineId === machineFilter),
    [rows, machineFilter]
  );

  function rowBg(pct: number) {
    if (pct < 10) return "bg-red-50/60";
    if (pct < 25) return "bg-yellow-50/50";
    return "";
  }

  function stockColor(pct: number) {
    if (pct < 10) return "text-danger";
    if (pct < 25) return "text-warning";
    return "text-success";
  }

  return (
    <>
      <TopBar title="Inventory" />
      <main className="flex-1 p-6 space-y-5">
        {/* Alert cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-card border-l-2 border-danger">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-danger" />
              <span className="text-xs font-semibold text-danger uppercase tracking-wide">Critical</span>
            </div>
            <p className="text-2xl font-semibold font-mono-data text-text-primary">{critical.length}</p>
            <p className="text-xs text-text-secondary mt-0.5">Slots below 10% capacity</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card border-l-2 border-warning">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xs font-semibold text-warning uppercase tracking-wide">Warning</span>
            </div>
            <p className="text-2xl font-semibold font-mono-data text-text-primary">{warning.length}</p>
            <p className="text-xs text-text-secondary mt-0.5">Slots below 25% capacity</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card border-l-2 border-success">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-xs font-semibold text-success uppercase tracking-wide">Healthy</span>
            </div>
            <p className="text-2xl font-semibold font-mono-data text-text-primary">
              {rows.length - critical.length - warning.length}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">Slots at adequate stock</p>
          </div>
        </div>

        {/* Machine filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {machines.map((m) => (
            <button
              key={m.id}
              onClick={() => setMachineFilter(m.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                machineFilter === m.id
                  ? "bg-accent text-white border-accent"
                  : "bg-white text-text-secondary border-gray-200 hover:border-gray-300"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Inventory table */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-text-primary">
              Stock Levels{" "}
              <span className="text-text-tertiary font-normal">({filtered.length} slots)</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Machine", "Product", "Stock", "Capacity", "% Full", "Daily Velocity", "Days Until Empty", "Last Restocked"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-xs font-semibold text-text-secondary text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-2.5">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : filtered
                      .sort((a, b) => a.stockPct - b.stockPct)
                      .map((row, i) => (
                        <tr key={`${row.machineId}:${row.productId}:${i}`} className={cn("border-t border-gray-50 hover:brightness-95 transition-all", rowBg(row.stockPct))}>
                          <td className="px-4 py-2.5 text-xs font-medium text-text-primary">
                            {row.machineName}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-text-secondary">
                            {row.productName}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-mono-data text-text-primary">
                            {row.currentQty}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-mono-data text-text-tertiary">
                            {row.maxQty}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={cn("text-xs font-semibold font-mono-data", stockColor(row.stockPct))}>
                              {row.stockPct.toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs font-mono-data text-text-secondary">
                            {row.dailyVelocity > 0 ? `${row.dailyVelocity}/day` : "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            {row.daysUntilEmpty !== null ? (
                              <span className={cn(
                                "text-xs font-mono-data font-medium px-2 py-0.5 rounded-full",
                                row.daysUntilEmpty <= 2 ? "bg-red-50 text-danger" :
                                row.daysUntilEmpty <= 5 ? "bg-yellow-50 text-warning" :
                                "text-text-secondary"
                              )}>
                                {row.daysUntilEmpty}d
                              </span>
                            ) : (
                              <span className="text-xs text-text-tertiary">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-text-tertiary">
                            {row.lastRestocked ? formatRelativeTime(row.lastRestocked) : "—"}
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Restock Planner */}
        <RestockPlanner rows={rows} />
      </main>
    </>
  );
}

function RestockPlanner({ rows }: { rows: InventoryRow[] }) {
  const urgent = rows.filter((r) => r.stockPct < 25).reduce((acc, r) => {
    const existing = acc.find((a) => a.machineId === r.machineId);
    if (existing) {
      existing.slots++;
      existing.urgentSlots += r.stockPct < 10 ? 1 : 0;
    } else {
      acc.push({
        machineId: r.machineId,
        machineName: r.machineName,
        slots: 1,
        urgentSlots: r.stockPct < 10 ? 1 : 0,
      });
    }
    return acc;
  }, [] as { machineId: string; machineName: string; slots: number; urgentSlots: number }[])
    .sort((a, b) => b.urgentSlots - a.urgentSlots || b.slots - a.slots)
    .slice(0, 5);

  if (urgent.length === 0) return null;

  return (
    <Card>
      <CardHeader title="Restock Planner" subtitle="Suggested priority order based on stock urgency" />
      <div className="space-y-2">
        {urgent.map((m, i) => (
          <div key={m.machineId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <span className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold text-text-secondary">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{m.machineName}</p>
              <p className="text-xs text-text-tertiary">
                {m.urgentSlots > 0 && (
                  <span className="text-danger font-medium">{m.urgentSlots} critical, </span>
                )}
                {m.slots} slots need restocking
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
