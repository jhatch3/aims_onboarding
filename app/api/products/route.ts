import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCached } from "@/lib/redis";
import { subDays } from "date-fns";

export async function GET() {
  try {
    const data = await getCached("products:list", async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);

      const [{ data: products }, { data: txs }, { data: slotRows }] = await Promise.all([
        supabase.from("products").select("*").order("name"),
        supabase
          .from("transactions")
          .select("product_id, amount, quantity")
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase.from("slots").select("product_id"),
      ]);

      // Sales per product
      const salesMap: Record<string, { revenue: number; units: number }> = {};
      for (const tx of txs ?? []) {
        if (!salesMap[tx.product_id]) salesMap[tx.product_id] = { revenue: 0, units: 0 };
        salesMap[tx.product_id].revenue += tx.amount;
        salesMap[tx.product_id].units += tx.quantity;
      }

      // Machine count per product (# of slots carrying it)
      const slotCount: Record<string, number> = {};
      for (const s of slotRows ?? []) {
        slotCount[s.product_id] = (slotCount[s.product_id] ?? 0) + 1;
      }

      return (products ?? []).map((p) => {
        const sales = salesMap[p.id] ?? { revenue: 0, units: 0 };
        const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          cost: p.cost,
          totalUnits: sales.units,
          totalRevenue: Math.round(sales.revenue * 100) / 100,
          machineCount: slotCount[p.id] ?? 0,
          margin: Math.round(margin * 10) / 10,
          imageUrl: p.image_url,
        };
      });
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
