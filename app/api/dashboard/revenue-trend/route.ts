import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCached } from "@/lib/redis";
import { format, subDays, eachDayOfInterval } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = parseInt(searchParams.get("range") ?? "30");

  try {
    const trend = await getCached(`dashboard:revenue-trend:${range}`, async () => {
      const now = new Date();
      const startDate = subDays(now, range);

      const { data: txs } = await supabase
        .from("transactions")
        .select("amount, created_at")
        .gte("created_at", startDate.toISOString());

      const byDate: Record<string, number> = {};
      for (const tx of txs ?? []) {
        const key = format(new Date(tx.created_at), "yyyy-MM-dd");
        byDate[key] = (byDate[key] ?? 0) + tx.amount;
      }

      const days = eachDayOfInterval({ start: startDate, end: now });
      return days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        return { date: key, revenue: Math.round((byDate[key] ?? 0) * 100) / 100 };
      });
    });

    return NextResponse.json(trend);
  } catch (error) {
    console.error("Revenue trend error:", error);
    return NextResponse.json({ error: "Failed to fetch trend" }, { status: 500 });
  }
}
