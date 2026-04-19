"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProduct, toggleProductStatus } from "@/app/actions/products";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Search,
  Star,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  categories: { name: string } | null;
};

type SortKey = "name" | "price" | "stock";
type SortDir = "asc" | "desc" | null;

const PAGE_SIZE = 10;

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
  if (sortDir === "asc") return <ChevronUp className="h-3 w-3" />;
  return <ChevronDown className="h-3 w-3" />;
}

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // ── Filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categories?.name ?? "").toLowerCase().includes(q)
    );
  }, [products, search]);

  // ── Sort ──
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = typeof va === "string" ? va.localeCompare(vb as string) : (va as number) - (vb as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Paginate ──
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortKey(null); setSortDir(null); }
    setPage(1);
  }

  function handleSearch(v: string) { setSearch(v); setPage(1); setSelected(new Set()); }

  // ── Selection ──
  const allSelected = pageItems.length > 0 && pageItems.every((p) => selected.has(p.id));
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      allSelected ? pageItems.forEach((p) => next.delete(p.id)) : pageItems.forEach((p) => next.add(p.id));
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  async function handleToggle(id: string, newValue: boolean) {
    startTransition(async () => {
      const result = await toggleProductStatus(id, newValue);
      if (!result.success) toast.error(result.error);
      else toast.success(newValue ? "Product activated" : "Product deactivated");
    });
  }

  async function handleDelete(id: string) {
    const result = await deleteProduct(id);
    if (!result.success) toast.error(result.error);
    else { toast.success("Product deleted"); setSelected((p) => { const n = new Set(p); n.delete(id); return n; }); }
  }

  const thClass = "px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider";
  const sortThClass = thClass + " cursor-pointer select-none hover:text-gray-800 transition-colors";

  // ── Pagination helpers ──
  function pageNumbers() {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); return pages; }
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products or category…"
            className="pl-8 h-9 text-sm bg-white"
          />
        </div>
        {selected.size > 0 && (
          <span className="text-xs font-medium text-brand-navy bg-brand-navy/8 px-3 py-1.5 rounded-full">
            {selected.size} selected
          </span>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      {pageItems.length === 0 ? (
        <div className="py-16 text-center">
          <Search className="h-8 w-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No products match your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {/* Checkbox */}
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 accent-brand-navy cursor-pointer"
                  />
                </th>
                <th className={sortThClass} onClick={() => handleSort("name")}>
                  <span className="flex items-center gap-1.5">
                    Product <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th className={thClass}>Category</th>
                <th className={sortThClass} onClick={() => handleSort("price")}>
                  <span className="flex items-center gap-1.5">
                    Price <SortIcon col="price" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th className={sortThClass} onClick={() => handleSort("stock")}>
                  <span className="flex items-center gap-1.5">
                    Stock <SortIcon col="stock" sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
                <th className={thClass}>Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageItems.map((product) => {
                const isSelected = selected.has(product.id);
                return (
                  <tr
                    key={product.id}
                    className={`transition-colors ${isSelected ? "bg-brand-navy/[0.03]" : "hover:bg-gray-50/70"}`}
                  >
                    {/* Checkbox */}
                    <td className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(product.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-brand-navy cursor-pointer"
                      />
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-100">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">—</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">
                            {product.name}
                          </p>
                          {product.is_featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-brand-gold font-semibold">
                              <Star className="h-2.5 w-2.5 fill-brand-gold" />
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {product.categories?.name ?? "—"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 font-semibold text-gray-800">
                      {formatPrice(product.price)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-sm font-semibold ${
                          product.stock === 0
                            ? "text-red-500"
                            : product.stock <= 5
                            ? "text-orange-500"
                            : "text-gray-700"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggle(product.id, !product.is_active)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          product.is_active
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${product.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                        {product.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-brand-navy bg-brand-navy/8 hover:bg-brand-navy/15 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &quot;{product.name}&quot; and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(product.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-gray-400">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>

            {pageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="w-8 text-center text-xs text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === p
                      ? "bg-brand-navy text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
