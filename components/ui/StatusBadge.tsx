import { cn } from "@/lib/utils";
import type { MachineStatus } from "@/types";

interface StatusBadgeProps {
  status: MachineStatus | "low_stock" | "critical";
  className?: string;
}

const statusConfig = {
  ONLINE: {
    label: "Online",
    dot: "bg-success",
    bg: "bg-green-50",
    text: "text-success",
  },
  OFFLINE: {
    label: "Offline",
    dot: "bg-danger",
    bg: "bg-red-50",
    text: "text-danger",
  },
  MAINTENANCE: {
    label: "Maintenance",
    dot: "bg-warning",
    bg: "bg-yellow-50",
    text: "text-warning",
  },
  low_stock: {
    label: "Low Stock",
    dot: "bg-warning",
    bg: "bg-yellow-50",
    text: "text-warning",
  },
  critical: {
    label: "Critical",
    dot: "bg-danger",
    bg: "bg-red-50",
    text: "text-danger",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
