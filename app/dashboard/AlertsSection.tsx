"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { MachineAlert } from "@/types";

export function AlertsSection() {
  const [alerts, setAlerts] = useState<MachineAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/alerts")
      .then((r) => r.json())
      .then((d) => {
        setAlerts(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader
        title="Needs Attention"
        subtitle={`${alerts.length} machine${alerts.length !== 1 ? "s" : ""} require action`}
      />
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-gray-50 rounded-lg" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-success font-medium">All machines running smoothly</p>
          <p className="text-xs text-text-tertiary mt-1">No issues detected</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/machines/${alert.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  alert.severity === "critical" ? "bg-red-50" : "bg-yellow-50"
                }`}
              >
                {alert.severity === "critical" ? (
                  <AlertCircle className="w-3.5 h-3.5 text-danger" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                  {alert.name}
                </p>
                <p className="text-xs text-text-tertiary truncate">{alert.issue}</p>
              </div>
              <StatusBadge status={alert.status === "ONLINE" ? "low_stock" : alert.status} />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
