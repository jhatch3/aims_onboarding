import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCached } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "today";

  try {
    const stats = await getCached(`dashboard:stats:${range}`, async () => {
      const now = new Date();
      let startDate: Date;
      let prevStartDate: Date;
      let prevEndDate: Date;

      if (range === "today") {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 1);
        prevEndDate = new Date(startDate);
      } else if (range === "week") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 7);
        prevEndDate = new Date(startDate);
      } else {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - 30);
        prevEndDate = new Date(startDate);
      }

      const [{ data: currentTxs }, { data: prevTxs }, { data: machines }] = await Promise.all([
        // Bug fix: added upper bound .lte(now) to avoid future-dated transactions
        supabase
          .from("transactions")
          .select("amount")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", now.toISOString()),
        supabase
          .from("transactions")
          .select("amount")
          .gte("created_at", prevStartDate.toISOString())
          .lt("created_at", prevEndDate.toISOString()),
        supabase.from("machines").select("status"),
      ]);

      const totalRevenue = currentTxs?.reduce((acc, t) => acc + t.amount, 0) ?? 0;
      const totalTransactions = currentTxs?.length ?? 0;
      const prevRevenue = prevTxs?.reduce((acc, t) => acc + t.amount, 0) ?? 0;
      const prevTransactions = prevTxs?.length ?? 0;

      const totalMachines = machines?.length ?? 0;
      const activeMachines = machines?.filter((m) => m.status === "ONLINE").length ?? 0;

      return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalTransactions,
        activeMachines,
        totalMachines,
        avgRevenuePerMachine:
          activeMachines > 0 ? Math.round((totalRevenue / activeMachines) * 100) / 100 : 0,
        revenueChange:
          prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0,
        transactionChange:
          prevTransactions > 0
            ? ((totalTransactions - prevTransactions) / prevTransactions) * 100
            : 0,
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
