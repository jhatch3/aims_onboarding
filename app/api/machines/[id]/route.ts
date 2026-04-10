import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const today = startOfDay(new Date());

    // Fetch machine base data + slots separately from events (referencedTable is not a valid Supabase JS option)
    const [
      { data: machine },
      { data: machineEvents },
      { data: todayTxs },
      { data: allTxs },
      { data: trendTxs },
    ] = await Promise.all([
      supabase
        .from("machines")
        .select("id, name, location, latitude, longitude, status, slots(id, position, current_qty, max_qty, product:products(name))")
        .eq("id", id)
        .single(),
      // Events queried separately so we can order + limit correctly
      supabase
        .from("machine_events")
        .select("id, type, details, created_at")
        .eq("machine_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("transactions")
        .select("amount")
        .eq("machine_id", id)
        .gte("created_at", today.toISOString()),
      supabase
        .from("transactions")
        .select("amount")
        .eq("machine_id", id),
      supabase
        .from("transactions")
        .select("amount, product_id, quantity, created_at")
        .eq("machine_id", id)
        .gte("created_at", thirtyDaysAgo.toISOString()),
    ]);

    if (!machine) {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 });
    }

    const todayRevenue = todayTxs?.reduce((acc, t) => acc + t.amount, 0) ?? 0;
    const totalRevenue = allTxs?.reduce((acc, t) => acc + t.amount, 0) ?? 0;

    // ── Revenue trend ────────────────────────────────────────────────────────
    const byDate: Record<string, number> = {};
    for (const tx of trendTxs ?? []) {
      const key = format(new Date(tx.created_at), "yyyy-MM-dd");
      byDate[key] = (byDate[key] ?? 0) + tx.amount;
    }
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
    const revenueChart = days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      return { date: key, revenue: Math.round((byDate[key] ?? 0) * 100) / 100 };
    });

    // ── Product breakdown ─────────────────────────────────────────────────────
    const productMap: Record<string, { revenue: number; units: number }> = {};
    for (const tx of trendTxs ?? []) {
      if (!productMap[tx.product_id]) productMap[tx.product_id] = { revenue: 0, units: 0 };
      productMap[tx.product_id].revenue += tx.amount;
      productMap[tx.product_id].units += tx.quantity ?? 1;
    }
    const topProductIds = Object.entries(productMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([pid]) => pid);

    const { data: productRows } = topProductIds.length
      ? await supabase.from("products").select("id, name, category").in("id", topProductIds)
      : { data: [] };
    const prodNameMap = new Map((productRows ?? []).map((p) => [p.id, p]));

    const productBreakdown = topProductIds.map((pid) => ({
      id: pid,
      name: prodNameMap.get(pid)?.name ?? "Unknown",
      category: prodNameMap.get(pid)?.category ?? "",
      revenue: Math.round(productMap[pid].revenue * 100) / 100,
      units: productMap[pid].units,
    }));

    // ── Machine health ────────────────────────────────────────────────────────
    const events = machineEvents ?? [];
    const onlineCount = events.filter((e) => e.type === "online").length;
    const offlineCount = events.filter((e) => e.type === "offline").length;
    const errorCount = events.filter((e) => e.type === "error").length;
    const total = onlineCount + offlineCount;
    const uptime = total > 0 ? (onlineCount / total) * 100 : 98;

    // ── Slots ─────────────────────────────────────────────────────────────────
    const slots = (machine.slots ?? []) as unknown as {
      id: string;
      position: number;
      current_qty: number;
      max_qty: number;
      product: { name: string } | null;
    }[];

    return NextResponse.json({
      id: machine.id,
      name: machine.name,
      location: machine.location,
      latitude: machine.latitude,
      longitude: machine.longitude,
      status: machine.status,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      uptime: Math.round(uptime * 10) / 10,
      errorCount,
      slots: slots.map((s) => ({
        id: s.id,
        position: s.position,
        productName: s.product?.name ?? "Unknown",
        currentQty: s.current_qty,
        maxQty: s.max_qty,
        stockPct: s.max_qty > 0 ? Math.round((s.current_qty / s.max_qty) * 100) : 0,
      })),
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        details: e.details,
        createdAt: e.created_at,
      })),
      revenueChart,
      productBreakdown,
    });
  } catch (error) {
    console.error("Machine detail error:", error);
    return NextResponse.json({ error: "Failed to fetch machine" }, { status: 500 });
  }
}
