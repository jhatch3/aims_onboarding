"use client";

import { useState, useEffect, useMemo } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Search, Download, ChevronUp, ChevronDown, Package } from "lucide-react";
import type { ProductListItem } from "@/types";

type SortKey = keyof Pick<ProductListItem, "name" | "totalUnits" | "totalRevenue" | "machineCount" | "margin" | "price">;
type SortDir = "asc" | "desc";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("totalRevenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
        const matchesCat = category === "all" || p.category === category;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
  }, [products, search, category, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return <ChevronDown className="w-3 h-3 text-text-tertiary opacity-0 group-hover:opacity-100" />;
    return sortDir === "desc" ? (
      <ChevronDown className="w-3 h-3 text-accent" />
    ) : (
      <ChevronUp className="w-3 h-3 text-accent" />
    );
  }

  const cols: { key: SortKey; label: string; right?: boolean }[] = [
    { key: "name", label: "Product" },
    { key: "totalUnits", label: "Units Sold", right: true },
    { key: "totalRevenue", label: "Revenue", right: true },
    { key: "price", label: "Price", right: true },
    { key: "margin", label: "Margin", right: true },
    { key: "machineCount", label: "Machines", right: true },
  ];

  function exportCSV() {
    const headers = ["Name", "Category", "Price", "Cost", "Units Sold", "Revenue", "Margin %", "Machines"];
    const rows = filtered.map((p) =>
      [p.name, p.category, p.price, p.cost, p.totalUnits, p.totalRevenue, p.margin, p.machineCount].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <TopBar title="Products" />
      <main className="flex-1 p-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 h-8 flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm text-text-primary placeholder-text-tertiary outline-none bg-transparent w-full"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                  category === cat
                    ? "bg-accent text-white border-accent"
                    : "bg-white text-text-secondary border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={exportCSV} className="ml-auto">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>

        <p className="text-xs text-text-tertiary mb-3">{filtered.length} products</p>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {cols.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`group px-4 py-3 text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary select-none ${
                      col.right ? "text-right" : "text-left"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                      {cols.map((c) => (
                        <td key={c.key} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((product, i) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-accent-light/40 transition-colors ${i % 2 === 0 ? "bg-gray-50/30" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-3.5 h-3.5 text-text-tertiary" />
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{product.name}</p>
                            <p className="text-xs text-text-tertiary">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono-data text-text-primary">
                        {formatNumber(product.totalUnits)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-data font-semibold text-text-primary">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-data text-text-secondary">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-xs font-medium font-mono-data px-2 py-0.5 rounded-full ${
                            product.margin > 60
                              ? "bg-green-50 text-success"
                              : product.margin > 40
                              ? "bg-yellow-50 text-warning"
                              : "bg-red-50 text-danger"
                          }`}
                        >
                          {product.margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono-data text-text-secondary">
                        {product.machineCount}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}