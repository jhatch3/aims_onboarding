"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  Package,
  Archive,
  DollarSign,
  MapPin,
  Settings,
  Zap,
  ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/machines", label: "Machines", icon: Cpu },
  { href: "/products", label: "Products", icon: Package },
  { href: "/inventory", label: "Inventory", icon: Archive },
  { href: "/revenue", label: "Revenue", icon: DollarSign },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 flex flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-base font-semibold text-text-primary tracking-tight">
            vend
          </span>
          <span className="text-base font-semibold text-accent tracking-tight">AR</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-accent" : "text-text-tertiary"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* AR App link — sits above the footer, separated visually */}
      <div className="px-3 pb-3">
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-blue-700 transition-colors duration-150"
        >
          <ScanLine className="w-4 h-4 flex-shrink-0" />
          Open AR View
        </a>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">Alex Operator</p>
            <p className="text-xs text-text-tertiary truncate">alex@vendor.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
