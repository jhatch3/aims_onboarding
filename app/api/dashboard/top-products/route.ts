import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCached } from "@/lib/redis";
import { subDays } from "date-fns";

export async function GET() {
  try {
    const data = await getCached("dashboard:top-products", async () => {
      const startDate = subDays(new Date(), 30);

      // Fetch raw transactions — no join to avoid silent skipping
      const { data: txs } = await supabase
        .from("transactions")
        .select("product_id, amount, quantity")
        .gte("created_at", startDate.toISOString());

      // Aggregate by product_id in JS — every transaction is counted
      const byProduct: Record<string, { revenue: number; units: number }> = {};
      for (const tx of txs ?? []) {
        if (!byProduct[tx.product_id]) byProduct[tx.product_id] = { revenue: 0, units: 0 };
        byProduct[tx.product_id].revenue += tx.amount;
        byProduct[tx.product_id].units += tx.quantity ?? 1;
      }

      const topIds = Object.entries(byProduct)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
        .map(([id]) => id);

      if (topIds.length === 0) return [];

      const { data: products } = await supabase
        .from("products")
        .select("id, name, category")
        .in("id", topIds);

      const productMap = new Map((products ?? []).map((p) => [p.id, p]));

      return topIds.map((id) => ({
        id,
        name: productMap.get(id)?.name ?? "Unknown",
        category: productMap.get(id)?.category ?? "",
        revenue: Math.round(byProduct[id].revenue * 100) / 100,
        units: byProduct[id].units,
      }));
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Top products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
