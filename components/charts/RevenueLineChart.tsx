"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { RevenueTrendPoint } from "@/types";

interface RevenueLineChartProps {
  data: RevenueTrendPoint[];
  prevData?: RevenueTrendPoint[];
  height?: number;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-card px-3 py-2 text-sm">
      <p className="text-text-secondary text-xs mb-1">
        {label ? format(parseISO(label), "MMM d, yyyy") : ""}
      </p>
      {payload.map((entry, i) => (
        <p key={i} className="font-mono-data font-medium" style={{ color: entry.color }}>
          ${entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export function RevenueLineChart({ data, prevData, height = 200 }: RevenueLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F3F4F6" />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => format(parseISO(v), "MMM d")}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        {prevData && (
          <Line
            data={prevData}
            dataKey="revenue"
            stroke="#E5E7EB"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="Previous"
          />
        )}
        <Line
          dataKey="revenue"
          stroke="#2563EB"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
