import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const machineId = searchParams.get("machineId");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  try {
    let query = supabase
      .from("transactions")
      .select("id, amount, quantity, created_at, machine:machines(name), product:products(name)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (machineId) query = query.eq("machine_id", machineId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      (data ?? []).map((tx) => {
        const machine = tx.machine as unknown as { name: string } | null;
        const product = tx.product as unknown as { name: string } | null;
        return {
          id: tx.id,
          machineName: machine?.name ?? "Unknown",
          productName: product?.name ?? "Unknown",
          amount: tx.amount,
          quantity: tx.quantity,
          createdAt: tx.created_at,
        };
      })
    );
  } catch (error) {
    console.error("Transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
