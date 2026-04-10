"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StockBar } from "@/components/ui/StockBar";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { Plus, LayoutGrid, List, MapPin, Calendar } from "lucide-react";
import type { MachineListItem } from "@/types";

type Filter = "all" | "online" | "offline" | "low_stock";

export default function MachinesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [machines, setMachines] = useState<MachineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setLoading(true);
    const param = filter === "low_stock" ? "all" : filter;
    fetch(`/api/machines?status=${param}`)
      .then((r) => r.json())
      .then((d) => {
        setMachines(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const displayed =
    filter === "low_stock"
      ? machines.filter((m) => m.stockPct < 25)
      : machines;

  const filterOptions: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "online", label: "Online" },
    { key: "offline", label: "Offline" },
    { key: "low_stock", label: "Low Stock" },
  ];

  return (
    <>
      <TopBar title="Machines" />
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {filterOptions.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ${
                  filter === f.key
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-white text-text-secondary border-gray-200 hover:border-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 ${view === "grid" ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-text-secondary" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 ${view === "list" ? "bg-gray-100" : "bg-white hover:bg-gray-50"}`}
              >
                <List className="w-3.5 h-3.5 text-text-secondary" />
              </button>
            </div>
            <Button size="sm">
              <Plus className="w-3.5 h-3.5" />
              Add Machine
            </Button>
          </div>
        </div>

        {/* Machine count */}
        <p className="text-xs text-text-tertiary mb-4">
          {loading ? "Loading..." : `${displayed.length} machine${displayed.length !== 1 ? "s" : ""}`}
        </p>

        {/* Grid/List */}
        {loading ? (
          <div className={view === "grid" ? "grid grid-cols-3 gap-4" : "space-y-3"}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse bg-white rounded-xl shadow-card" />
            ))}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-3 gap-4">
            {displayed.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((machine) => (
              <MachineRow key={machine.id} machine={machine} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function MachineCard({ machine }: { machine: MachineListItem }) {
  return (
    <Link href={`/machines/${machine.id}`}>
      <div className="bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{machine.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-text-tertiary flex-shrink-0" />
              <p className="text-xs text-text-tertiary truncate">{machine.location}</p>
            </div>
          </div>
          <StatusBadge status={machine.status} className="ml-2 flex-shrink-0" />
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">Stock Level</span>
            <span className="text-xs font-medium text-text-primary font-mono-data">
              {machine.stockPct.toFixed(0)}%
            </span>
          </div>
          <StockBar pct={machine.stockPct} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">Today's Revenue</p>
            <p className="text-sm font-semibold text-text-primary font-mono-data">
              {formatCurrency(machine.todayRevenue)}
            </p>
          </div>
          {machine.lastRestocked && (
            <div className="text-right">
              <p className="text-xs text-text-secondary">Last Restocked</p>
              <p className="text-xs text-text-tertiary">{formatRelativeTime(machine.lastRestocked)}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function MachineRow({ machine }: { machine: MachineListItem }) {
  return (
    <Link href={`/machines/${machine.id}`}>
      <div className="bg-white rounded-xl px-5 py-3.5 shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">{machine.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-text-tertiary" />
            <p className="text-xs text-text-tertiary">{machine.location}</p>
          </div>
        </div>
        <StatusBadge status={machine.status} />
        <div className="w-32">
          <StockBar pct={machine.stockPct} showLabel />
        </div>
        <div className="text-right w-24">
          <p className="text-xs text-text-secondary">Today</p>
          <p className="text-sm font-semibold text-text-primary font-mono-data">
            {formatCurrency(machine.todayRevenue)}
          </p>
        </div>
        {machine.lastRestocked && (
          <div className="text-right w-32">
            <p className="text-xs text-text-secondary">Restocked</p>
            <p className="text-xs text-text-tertiary">{formatRelativeTime(machine.lastRestocked)}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
