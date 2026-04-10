import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { startOfDay } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    let machinesQuery = supabase
      .from("machines")
      .select("id, name, location, latitude, longitude, status, slots(current_qty, max_qty)")
      .order("name");

    if (status && status !== "all") {
      machinesQuery = machinesQuery.eq("status", status.toUpperCase());
    }

    const [{ data: machines }, { data: todayTxs }, { data: restocks }] = await Promise.all([
      machinesQuery,
      supabase
        .from("transactions")
        .select("machine_id, amount")
        .gte("created_at", startOfDay(new Date()).toISOString()),
      supabase
        .from("machine_events")
        .select("machine_id, created_at")
        .eq("type", "restock")
        .order("created_at", { ascending: false }),
    ]);

    // Revenue map: machineId → total today
    const revenueMap: Record<string, number> = {};
    for (const tx of todayTxs ?? []) {
      revenueMap[tx.machine_id] = (revenueMap[tx.machine_id] ?? 0) + tx.amount;
    }

    // Most recent restock per machine
    const restockMap: Record<string, string> = {};
    for (const ev of restocks ?? []) {
      if (!restockMap[ev.machine_id]) restockMap[ev.machine_id] = ev.created_at;
    }

    return NextResponse.json(
      (machines ?? []).map((m) => {
        const slots = (m.slots ?? []) as { current_qty: number; max_qty: number }[];
        const totalCap = slots.reduce((acc, s) => acc + s.max_qty, 0);
        const totalCur = slots.reduce((acc, s) => acc + s.current_qty, 0);
        const stockPct = totalCap > 0 ? (totalCur / totalCap) * 100 : 0;

        return {
          id: m.id,
          name: m.name,
          location: m.location,
          latitude: m.latitude,
          longitude: m.longitude,
          status: m.status,
          todayRevenue: Math.round((revenueMap[m.id] ?? 0) * 100) / 100,
          stockPct: Math.round(stockPct * 10) / 10,
          lastRestocked: restockMap[m.id] ?? null,
        };
      })
    );
  } catch (error) {
    console.error("Machines error:", error);
    return NextResponse.json({ error: "Failed to fetch machines" }, { status: 500 });
  }
}
