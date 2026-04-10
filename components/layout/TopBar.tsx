"use client";

import { Bell, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
      {title && (
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      )}

      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <div
          className={cn(
            "flex items-center gap-2 h-8 px-3 rounded-lg bg-gray-50 border transition-all duration-150",
            searchFocused ? "border-accent bg-white w-56" : "border-transparent w-44"
          )}
        >
          <Search className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors">
          <Bell className="w-4 h-4 text-text-secondary" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity">
          A
        </div>
      </div>
    </header>
  );
}
