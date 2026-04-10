"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { TopProductsChart } from "@/components/charts/TopProductsChart";
import type { TopProduct } from "@/types";

export function TopProductsPanel() {
  const [data, setData] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/top-products")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader title="Top Products" subtitle="Last 30 days" />
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse bg-gray-50 rounded-lg" />
          ))}
        </div>
      ) : data.length > 0 ? (
        <TopProductsChart data={data} />
      ) : (
        <div className="h-40 flex items-center justify-center text-sm text-text-tertiary">
          No data available
        </div>
      )}
    </Card>
  );
}
