"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { RevenueLineChart } from "@/components/charts/RevenueLineChart";
import type { RevenueTrendPoint } from "@/types";

type RangeDays = 7 | 30;

export function RevenueSection() {
  const [range, setRange] = useState<RangeDays>(30);
  const [data, setData] = useState<RevenueTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/revenue-trend?range=${range}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [range]);

  const total = data.reduce((acc, d) => acc + d.revenue, 0);

  return (
    <Card>
      <CardHeader
        title="Revenue Trend"
        subtitle={`$${total.toFixed(2)} total over ${range} days`}
        action={
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
            {([7, 30] as RangeDays[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                  range === r ? "bg-white text-text-primary shadow-sm" : "text-text-tertiary"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        }
      />
      {loading ? (
        <div className="h-48 animate-pulse bg-gray-50 rounded-lg" />
      ) : (
        <RevenueLineChart data={data} height={192} />
      )}
    </Card>
  );
}
