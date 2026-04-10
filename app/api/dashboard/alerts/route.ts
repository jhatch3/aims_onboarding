import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCached } from "@/lib/redis";

export async function GET() {
  try {
    const alerts = await getCached("dashboard:alerts", async () => {
      const [{ data: offlineMachines }, { data: slots }] = await Promise.all([
        supabase
          .from("machines")
          .select("id, name, location, status")
          .in("status", ["OFFLINE", "MAINTENANCE"])
          .limit(5),
        // Fetch low-stock slots with machine info — filter on machine.status in JS
        // to avoid unreliable PostgREST embedded filter syntax
        supabase
          .from("slots")
          .select("machine_id, current_qty, max_qty, machine:machines(id, name, location, status)")
          .gt("current_qty", 0),
      ]);

      // Find the lowest-stocked slot per ONLINE machine
      const lowStockMap = new Map<
        string,
        { pct: number; machine: { id: string; name: string; location: string } }
      >();

      for (const slot of slots ?? []) {
        const machine = slot.machine as unknown as {
          id: string;
          name: string;
          location: string;
          status: string;
        } | null;

        if (!machine || machine.status !== "ONLINE") continue;

        const pct = slot.max_qty > 0 ? (slot.current_qty / slot.max_qty) * 100 : 0;
        if (pct < 25) {
          const existing = lowStockMap.get(slot.machine_id);
          if (!existing || pct < existing.pct) {
            lowStockMap.set(slot.machine_id, { pct, machine });
          }
        }
      }

      const result = [
        ...(offlineMachines ?? []).map((m) => ({
          id: m.id,
          name: m.name,
          location: m.location,
          status: m.status as "OFFLINE" | "MAINTENANCE",
          issue: m.status === "OFFLINE" ? "Machine offline" : "Under maintenance",
          severity: (m.status === "OFFLINE" ? "critical" : "warning") as "critical" | "warning",
        })),
        ...Array.from(lowStockMap.values()).map(({ pct, machine }) => ({
          id: machine.id,
          name: machine.name,
          location: machine.location,
          status: "ONLINE" as const,
          issue: pct < 10 ? "Out of stock soon" : "Low stock",
          severity: (pct < 10 ? "critical" : "warning") as "critical" | "warning",
        })),
      ].slice(0, 6);

      return result;
    }, 60);

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
