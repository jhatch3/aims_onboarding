import { TopBar } from "@/components/layout/TopBar";
import { DashboardMetrics } from "./DashboardMetrics";
import { RevenueSection } from "./RevenueSection";
import { AlertsSection } from "./AlertsSection";
import { TransactionFeed } from "./TransactionFeed";
import { TopProductsPanel } from "./TopProductsPanel";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        <DashboardMetrics />

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <RevenueSection />
          </div>
          <div className="col-span-1">
            <TopProductsPanel />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <AlertsSection />
          <TransactionFeed />
        </div>
      </main>
    </>
  );
}
