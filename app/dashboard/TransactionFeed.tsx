"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { RecentTransaction } from "@/types";

export function TransactionFeed() {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions?limit=20")
      .then((r) => r.json())
      .then((d) => {
        setTransactions(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader title="Recent Transactions" subtitle="Live feed" />
      <div className="overflow-y-auto max-h-72 scrollbar-thin -mx-1 px-1">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse bg-gray-50 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {tx.productName}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">{tx.machineName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-text-primary font-mono-data">
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatRelativeTime(tx.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
