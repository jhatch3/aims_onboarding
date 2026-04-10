"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StockBar } from "@/components/ui/StockBar";
import { RevenueLineChart } from "@/components/charts/RevenueLineChart";
import { formatCurrency, formatRelativeTime, formatPercent } from "@/lib/utils";
import { ArrowLeft, MapPin, Zap, AlertCircle, CheckCircle, RotateCcw, WifiOff, Wifi } from "lucide-react";
import type { MachineDetail } from "@/types";

export default function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [machine, setMachine] = useState<MachineDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/machines/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setMachine(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <TopBar />
        <main className="flex-1 p-6 space-y-5">
          <div className="h-8 w-48 animate-pulse bg-white rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-white rounded-xl" />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (!machine) {
    return (
      <>
        <TopBar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-text-secondary">Machine not found</p>
        </main>
      </>
    );
  }

  const eventIcons: Record<string, React.ReactNode> = {
    restock: <RotateCcw className="w-3.5 h-3.5 text-accent" />,
    error: <AlertCircle className="w-3.5 h-3.5 text-danger" />,
    maintenance: <Zap className="w-3.5 h-3.5 text-warning" />,
    offline: <WifiOff className="w-3.5 h-3.5 text-danger" />,
    online: <Wifi className="w-3.5 h-3.5 text-success" />,
  };

  return (
    <>
      <TopBar />
      <main className="flex-1 p-6 space-y-5">
        {/* Back + header */}
        <div>
          <Link
            href="/machines"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Machines
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">{machine.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
                <p className="text-sm text-text-secondary">{machine.location}</p>
              </div>
            </div>
            <StatusBadge status={machine.status} />
          </div>
        </div>

        {/* Health metrics */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Today's Revenue", value: formatCurrency(machine.todayRevenue), mono: true },
            { label: "Total Revenue", value: formatCurrency(machine.totalRevenue), mono: true },
            { label: "Uptime", value: formatPercent(machine.uptime), mono: true },
            { label: "Error Events", value: String(machine.errorCount), mono: true },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl p-4 shadow-card">
              <p className="text-xs text-text-secondary mb-1">{m.label}</p>
              <p className={`text-xl font-semibold text-text-primary ${m.mono ? "font-mono-data" : ""}`}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue chart + product breakdown */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <Card>
              <CardHeader title="Revenue — Last 30 Days" />
              <RevenueLineChart data={machine.revenueChart} height={200} />
            </Card>
          </div>
          <div className="col-span-1">
            <Card>
              <CardHeader title="Top Products" subtitle="By revenue" />
              <div className="space-y-3">
                {machine.productBreakdown.slice(0, 6).map((p, i) => {
                  const max = machine.productBreakdown[0]?.revenue ?? 1;
                  return (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="text-xs text-text-tertiary w-4 font-mono-data">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-xs font-medium text-text-primary truncate">{p.name}</span>
                          <span className="text-xs font-mono-data text-text-primary ml-2">{formatCurrency(p.revenue)}</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${(p.revenue / max) * 100}%`, opacity: 1 - i * 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Slots + Events */}
        <div className="grid grid-cols-2 gap-5">
          {/* Slot inventory */}
          <Card>
            <CardHeader title="Slot Inventory" subtitle={`${machine.slots.length} slots`} />
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
              {machine.slots
                .sort((a, b) => a.stockPct - b.stockPct)
                .map((slot) => (
                  <div key={slot.id} className="flex items-center gap-3 py-1">
                    <span className="text-xs text-text-tertiary w-6 font-mono-data flex-shrink-0">
                      #{slot.position}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{slot.productName}</p>
                      <StockBar pct={slot.stockPct} />
                    </div>
                    <span className="text-xs font-mono-data text-text-secondary flex-shrink-0">
                      {slot.currentQty}/{slot.maxQty}
                    </span>
                  </div>
                ))}
            </div>
          </Card>

          {/* Event log */}
          <Card>
            <CardHeader title="Event History" subtitle="Recent machine events" />
            <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin">
              {machine.events.map((event) => (
                <div key={event.id} className="flex items-start gap-2.5 py-1.5">
                  <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {eventIcons[event.type] ?? <CheckCircle className="w-3.5 h-3.5 text-text-tertiary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary capitalize">{event.type}</p>
                    {event.details && (
                      <p className="text-xs text-text-tertiary">{event.details}</p>
                    )}
                  </div>
                  <p className="text-xs text-text-tertiary flex-shrink-0">
                    {formatRelativeTime(event.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}