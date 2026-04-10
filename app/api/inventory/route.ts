import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCached } from "@/lib/redis";
import { subDays } from "date-fns";

export async function GET() {
  try {
    const data = await getCached("inventory:list", async () => {
      const sevenDaysAgo = subDays(new Date(), 7);

      const [{ data: slots }, { data: txs }, { data: restocks }] = await Promise.all([
        supabase
          .from("slots")
          .select("id, position, machine_id, product_id, current_qty, max_qty, machine:machines(id, name, status), product:products(id, name)")
          .order("machine_id"),
        supabase
          .from("transactions")
          .select("machine_id, product_id, quantity")
          .gte("created_at", sevenDaysAgo.toISOString()),
        supabase
          .from("machine_events")
          .select("machine_id, created_at")
          .eq("type", "restock")
          .order("created_at", { ascending: false }),
      ]);

      // Daily velocity per machine+product
      const velocityMap: Record<string, number> = {};
      for (const tx of txs ?? []) {
        const key = `${tx.machine_id}:${tx.product_id}`;
        velocityMap[key] = (velocityMap[key] ?? 0) + tx.quantity;
      }
      for (const key in velocityMap) velocityMap[key] /= 7;

      // Most recent restock per machine
      const restockMap: Record<string, string> = {};
      for (const ev of restocks ?? []) {
        if (!restockMap[ev.machine_id]) restockMap[ev.machine_id] = ev.created_at;
      }

      return (slots ?? []).map((slot) => {
        const machine = slot.machine as unknown as { id: string; name: string; status: string };
        const product = slot.product as unknown as { id: string; name: string };
        const stockPct = slot.max_qty > 0 ? (slot.current_qty / slot.max_qty) * 100 : 0;
        const key = `${slot.machine_id}:${slot.product_id}`;
        const dailyVelocity = velocityMap[key] ?? 0;
        const daysUntilEmpty = dailyVelocity > 0 ? Math.floor(slot.current_qty / dailyVelocity) : null;

        return {
          machineId: slot.machine_id,
          machineName: machine?.name ?? "Unknown",
          productId: slot.product_id,
          productName: product?.name ?? "Unknown",
          currentQty: slot.current_qty,
          maxQty: slot.max_qty,
          stockPct: Math.round(stockPct * 10) / 10,
          dailyVelocity: Math.round(dailyVelocity * 10) / 10,
          daysUntilEmpty,
          lastRestocked: restockMap[slot.machine_id] ?? null,
        };
      });
    }, 120);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Inventory error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}
