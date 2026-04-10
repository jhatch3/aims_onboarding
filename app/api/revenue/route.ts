import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCached } from "@/lib/redis";
import { format, eachDayOfInterval, parseISO, subDays } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  const end = endParam ? parseISO(endParam) : new Date();
  const start = startParam ? parseISO(startParam) : subDays(end, 30);
  const rangeKey = `${format(start, "yyyyMMdd")}-${format(end, "yyyyMMdd")}`;
  const prevStart = subDays(start, Math.ceil((end.getTime() - start.getTime()) / 86400000));

  try {
    const data = await getCached(`revenue:${rangeKey}`, async () => {
      // Fetch raw transactions without joins — joins cause silent data skipping
      const [{ data: txs }, { data: prevTxs }, { data: products }, { data: machines }] =
        await Promise.all([
          supabase
            .from("transactions")
            .select("amount, machine_id, product_id, quantity, created_at")
            .gte("created_at", start.toISOString())
            .lte("created_at", end.toISOString()),
          supabase
            .from("transactions")
            .select("amount, created_at")
            .gte("created_at", prevStart.toISOString())
            .lt("created_at", start.toISOString()),
          supabase.from("products").select("id, category, cost"),
          supabase.from("machines").select("id, name"),
        ]);

      // Lookup maps — no join required
      const productCostMap = new Map((products ?? []).map((p) => [p.id, p.cost]));
      const productCatMap = new Map((products ?? []).map((p) => [p.id, p.category]));
      const machineNameMap = new Map((machines ?? []).map((m) => [m.id, m.name]));

      // ── KPIs ───────────────────────────────────────────────────────────────
      const totalRevenue = txs?.reduce((acc, t) => acc + t.amount, 0) ?? 0;
      const totalProfit =
        txs?.reduce((acc, t) => {
          const cost = productCostMap.get(t.product_id) ?? 0;
          const qty = t.quantity ?? 1;
          return acc + (t.amount - cost * qty);
        }, 0) ?? 0;
      const totalTransactions = txs?.length ?? 0;
      const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // ── Revenue trend ──────────────────────────────────────────────────────
      const byDate: Record<string, number> = {};
      for (const tx of txs ?? []) {
        const key = format(new Date(tx.created_at), "yyyy-MM-dd");
        byDate[key] = (byDate[key] ?? 0) + tx.amount;
      }
      const trend = eachDayOfInterval({ start, end }).map((day) => {
        const key = format(day, "yyyy-MM-dd");
        return { date: key, revenue: Math.round((byDate[key] ?? 0) * 100) / 100 };
      });

      // ── Previous period trend ──────────────────────────────────────────────
      const prevByDate: Record<string, number> = {};
      for (const tx of prevTxs ?? []) {
        const key = format(new Date(tx.created_at), "yyyy-MM-dd");
        prevByDate[key] = (prevByDate[key] ?? 0) + tx.amount;
      }
      const prevTrend = eachDayOfInterval({
        start: prevStart,
        end: subDays(start, 1),
      }).map((day) => {
        const key = format(day, "yyyy-MM-dd");
        return { date: key, revenue: Math.round((prevByDate[key] ?? 0) * 100) / 100 };
      });

      // ── Revenue by machine — every tx counted via machine_id lookup ────────
      const machineRevMap: Record<string, number> = {};
      for (const tx of txs ?? []) {
        machineRevMap[tx.machine_id] = (machineRevMap[tx.machine_id] ?? 0) + tx.amount;
      }
      const revenueByMachine = Object.entries(machineRevMap)
        .map(([machineId, revenue]) => ({
          machineId,
          machineName: machineNameMap.get(machineId) ?? machineId,
          revenue: Math.round(revenue * 100) / 100,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // ── Revenue by category — every tx counted via product_id lookup ───────
      const catRevMap: Record<string, number> = {};
      for (const tx of txs ?? []) {
        const cat = productCatMap.get(tx.product_id) ?? "Other";
        catRevMap[cat] = (catRevMap[cat] ?? 0) + tx.amount;
      }
      const revenueByCategory = Object.entries(catRevMap)
        .map(([category, revenue]) => ({
          category,
          revenue: Math.round(revenue * 100) / 100,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // ── Heatmap: hour × day-of-week ────────────────────────────────────────
      const heatmapMap: Record<string, number> = {};
      for (const tx of txs ?? []) {
        const d = new Date(tx.created_at);
        const key = `${d.getHours()}:${d.getDay()}`;
        heatmapMap[key] = (heatmapMap[key] ?? 0) + tx.amount;
      }
      const heatmap: { hour: number; day: number; revenue: number }[] = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let day = 0; day < 7; day++) {
          heatmap.push({
            hour,
            day,
            revenue: Math.round((heatmapMap[`${hour}:${day}`] ?? 0) * 100) / 100,
          });
        }
      }

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        avgTransactionValue: Math.round(avgTransactionValue * 100) / 100,
        totalTransactions,
        trend,
        prevTrend,
        revenueByMachine,
        revenueByCategory,
        heatmap,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Revenue error:", error);
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 });
  }
}
