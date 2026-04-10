"use client";

import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StockBar } from "@/components/ui/StockBar";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { MapPin, Search, ExternalLink } from "lucide-react";
import type { MachineListItem } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const STATUS_COLORS: Record<string, string> = {
  ONLINE: "#10B981",
  OFFLINE: "#EF4444",
  MAINTENANCE: "#F59E0B",
};

export default function MapPage() {
  const [machines, setMachines] = useState<MachineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MachineListItem | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    fetch("/api/machines")
      .then((r) => r.json())
      .then((d) => {
        setMachines(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Initialize Mapbox when machines load
  useEffect(() => {
    if (!mapRef.current || loading || !MAPBOX_TOKEN || typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markerRefs: any[] = [];

    import("mapbox-gl").then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapboxgl = mod as any;
      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      if (!mapRef.current) return;

      const map = new mapboxgl.default.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-96, 38],
        zoom: 4,
      });

      mapInstance.current = map;

      map.on("load", () => {
        machines.forEach((machine) => {
          if (!machine.latitude || !machine.longitude) return;

          const el = document.createElement("div");
          el.className = "machine-pin";
          el.style.cssText = `
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: ${STATUS_COLORS[machine.status] ?? "#6B7280"};
            border: 2.5px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            cursor: pointer;
            transition: transform 0.15s ease;
          `;
          el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.4)"; });
          el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });
          el.addEventListener("click", () => setSelected(machine));

          const marker = new mapboxgl.default.Marker({ element: el })
            .setLngLat([machine.longitude!, machine.latitude!])
            .addTo(map);

          markerRefs.push(marker);
        });
      });
    });

    return () => {
      markerRefs.forEach((m) => m.remove());
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, [loading, machines]);

  const filtered = machines.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <TopBar title="Machine Map" />
      <div className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        {/* Sidebar list */}
        <div className="w-72 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 h-8">
              <Search className="w-3.5 h-3.5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search machines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs text-text-primary placeholder-text-tertiary outline-none bg-transparent w-full"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-3 border-b border-gray-50 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded mb-1.5" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                  </div>
                ))
              : filtered.map((machine) => (
                  <button
                    key={machine.id}
                    onClick={() => setSelected(selected?.id === machine.id ? null : machine)}
                    onMouseEnter={() => setHovered(machine.id)}
                    onMouseLeave={() => setHovered(null)}
                    className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selected?.id === machine.id ? "bg-accent-light" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-xs font-semibold truncate ${selected?.id === machine.id ? "text-accent" : "text-text-primary"}`}>
                        {machine.name}
                      </p>
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 ml-1"
                        style={{ backgroundColor: STATUS_COLORS[machine.status] }}
                      />
                    </div>
                    <p className="text-xs text-text-tertiary truncate mb-1.5">{machine.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-data font-medium text-text-primary">
                        {formatCurrency(machine.todayRevenue)}
                      </span>
                      <span className="text-xs text-text-tertiary font-mono-data">
                        {machine.stockPct.toFixed(0)}% stock
                      </span>
                    </div>
                  </button>
                ))}
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative">
          {!MAPBOX_TOKEN ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-sm">
                <MapPin className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                <p className="text-sm font-medium text-text-primary mb-1">Mapbox Token Required</p>
                <p className="text-xs text-text-secondary">
                  Set <code className="bg-gray-100 px-1 rounded font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your environment to enable the map view.
                </p>
                {/* Fallback: grid of machine cards */}
                <div className="mt-6 text-left space-y-2 max-h-[60vh] overflow-y-auto">
                  {machines.map((m) => (
                    <Link
                      key={m.id}
                      href={`/machines/${m.id}`}
                      className="block p-3 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-semibold text-text-primary">{m.name}</p>
                          <p className="text-xs text-text-tertiary">{m.location}</p>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono-data text-text-primary">{formatCurrency(m.todayRevenue)}</span>
                        <StockBar pct={m.stockPct} className="w-20" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-full" />
          )}

          {/* Selected machine popup */}
          {selected && (
            <div className="absolute top-4 right-4 w-64 bg-white rounded-xl shadow-card-hover p-4 z-10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{selected.name}</p>
                  <p className="text-xs text-text-tertiary truncate">{selected.location}</p>
                </div>
                <StatusBadge status={selected.status} className="ml-2 flex-shrink-0" />
              </div>
              <div className="space-y-2 mb-3">
                <div>
                  <p className="text-xs text-text-secondary">Today's Revenue</p>
                  <p className="text-sm font-semibold font-mono-data text-text-primary">
                    {formatCurrency(selected.todayRevenue)}
                  </p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-text-secondary">Stock Level</p>
                    <p className="text-xs font-mono-data text-text-primary">{selected.stockPct.toFixed(0)}%</p>
                  </div>
                  <StockBar pct={selected.stockPct} />
                </div>
              </div>
              <Link
                href={`/machines/${selected.id}`}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-accent bg-accent-light rounded-lg hover:bg-blue-100 transition-colors"
              >
                View Details
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}