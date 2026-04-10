"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import type { TopProduct } from "@/types";

interface TopProductsChartProps {
  data: TopProduct[];
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: TopProduct; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-card px-3 py-2 text-sm">
      <p className="font-medium text-text-primary">{item.name}</p>
      <p className="text-xs text-text-secondary">{item.category}</p>
      <p className="font-mono-data text-accent mt-1">${item.revenue.toFixed(2)}</p>
      <p className="text-xs text-text-tertiary">{item.units} units</p>
    </div>
  );
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <div className="space-y-2">
      {data.map((product, i) => {
        const maxRevenue = data[0]?.revenue ?? 1;
        const pct = (product.revenue / maxRevenue) * 100;
        return (
          <div key={product.id} className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary w-4 font-mono-data">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-text-primary truncate">{product.name}</span>
                <span className="text-xs font-medium text-text-primary font-mono-data ml-2 flex-shrink-0">
                  ${product.revenue.toFixed(2)}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, opacity: 1 - i * 0.12 }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
