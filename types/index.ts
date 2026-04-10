export type MachineStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE";

export interface DashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  activeMachines: number;
  totalMachines: number;
  avgRevenuePerMachine: number;
  revenueChange: number;
  transactionChange: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  revenue: number;
  units: number;
}

export interface MachineAlert {
  id: string;
  name: string;
  location: string;
  status: MachineStatus;
  issue: string;
  severity: "critical" | "warning" | "info";
}

export interface RecentTransaction {
  id: string;
  machineName: string;
  productName: string;
  amount: number;
  createdAt: string;
}

export interface MachineListItem {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: MachineStatus;
  todayRevenue: number;
  stockPct: number;
  lastRestocked: string | null;
}

export interface MachineDetail {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: MachineStatus;
  todayRevenue: number;
  totalRevenue: number;
  uptime: number;
  errorCount: number;
  slots: SlotDetail[];
  events: MachineEventItem[];
  revenueChart: RevenueTrendPoint[];
  productBreakdown: TopProduct[];
}

export interface SlotDetail {
  id: string;
  position: number;
  productName: string;
  currentQty: number;
  maxQty: number;
  stockPct: number;
}

export interface MachineEventItem {
  id: string;
  type: string;
  details: string | null;
  createdAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  totalUnits: number;
  totalRevenue: number;
  machineCount: number;
  margin: number;
  imageUrl: string | null;
}

export interface InventoryRow {
  machineId: string;
  machineName: string;
  productId: string;
  productName: string;
  currentQty: number;
  maxQty: number;
  stockPct: number;
  dailyVelocity: number;
  daysUntilEmpty: number | null;
  lastRestocked: string | null;
}

export interface RevenueStats {
  totalRevenue: number;
  totalProfit: number;
  avgTransactionValue: number;
  totalTransactions: number;
  revenueByMachine: { machineId: string; machineName: string; revenue: number }[];
  revenueByCategory: { category: string; revenue: number }[];
  heatmap: { hour: number; day: number; revenue: number }[];
  trend: RevenueTrendPoint[];
  prevTrend: RevenueTrendPoint[];
}
