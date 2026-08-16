"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EntryCard } from "@/components/entry-card";
import { AddEntryFab } from "@/components/add-entry-fab";
import { StatsRow } from "@/components/stats-row";
import { ENTRY_TYPE_LABELS } from "@/components/entry-form";
import { ENTRY_TYPES } from "@/lib/validations/entry";
import { buildResumeBullet } from "@/lib/resume-bullet";
import { cn } from "@/lib/utils";
import type { EntryDTO, EntryType } from "@/lib/types";

const PAGE_SIZE = 12;
const ALL_TYPES = "ALL";

type Stats = {
  total: number;
  byType: { type: EntryType; count: number }[];
  topTags: { tag: string; count: number }[];
};

type QueryOverrides = { cursor?: string; limit?: number };

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const tech = searchParams.get("tech") ?? "";
  const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

  const [searchInput, setSearchInput] = useState(q);
  const [techInput, setTechInput] = useState(tech);
  const [entries, setEntries] = useState<EntryDTO[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([
    undefined,
  ]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [exporting, setExporting] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`/dashboard?${params.toString()}`);
      setPageIndex(0);
      setCursorHistory([undefined]);
    },
    [router, searchParams],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== q) updateParam("q", searchInput);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (techInput !== tech) updateParam("tech", techInput);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [techInput]);

  const buildQuery = useCallback(
    (overrides: QueryOverrides = {}) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (type) params.set("type", type);
      if (tech) params.set("tech", tech);
      params.set("sort", sort);
      params.set("limit", String(overrides.limit ?? PAGE_SIZE));
      if (overrides.cursor) params.set("cursor", overrides.cursor);
      return params.toString();
    },
    [q, type, tech, sort],
  );

  const pageCursor = cursorHistory[pageIndex];

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount loading flag
    setLoading(true);
    Promise.all([
      fetch(`/api/entries?${buildQuery({ cursor: pageCursor })}`).then((res) =>
        res.json(),
      ),
      fetch("/api/entries/stats").then((res) => res.json()),
    ])
      .then(([list, statsData]) => {
        if (cancelled) return;
        setEntries(list.items);
        setNextCursor(list.nextCursor);
        setStats(statsData);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load entries.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buildQuery, pageCursor]);

  function handleNextPage() {
    if (!nextCursor) return;
    setCursorHistory((prev) => {
      if (prev[pageIndex + 1] === nextCursor) return prev;
      const next = [...prev];
      next[pageIndex + 1] = nextCursor;
      return next;
    });
    setPageIndex((p) => p + 1);
  }

  function handlePreviousPage() {
    setPageIndex((p) => Math.max(0, p - 1));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const all: EntryDTO[] = [];
      let cursor: string | undefined;
      const cap = 500;

      while (all.length < cap) {
        const res = await fetch(`/api/entries?${buildQuery({ cursor, limit: 50 })}`);
        const data = await res.json();
        all.push(...data.items);
        if (!data.nextCursor) break;
        cursor = data.nextCursor;
      }

      if (all.length === 0) {
        toast.error("No entries to export.");
        return;
      }

      const grouped = new Map<EntryType, EntryDTO[]>();
      for (const item of all) {
        const list = grouped.get(item.type) ?? [];
        list.push(item);
        grouped.set(item.type, list);
      }

      let markdown = `# Work Log Export\n\n`;
      for (const entryType of ENTRY_TYPES) {
        const list = grouped.get(entryType);
        if (!list?.length) continue;
        markdown += `## ${ENTRY_TYPE_LABELS[entryType]}\n\n`;
        for (const item of list) {
          markdown += `- ${buildResumeBullet(item)}\n`;
        }
        markdown += `\n`;
      }

      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logger-export-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${all.length} ${all.length === 1 ? "entry" : "entries"}${
          all.length >= cap ? " (capped at 500)" : ""
        }.`,
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Your engineering work log.</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="size-4" />
            {exporting ? "Exporting…" : "Export"}
          </Button>
          <Link href="/entries/new" className={cn(buttonVariants())}>
            Add entry
          </Link>
        </div>
      </div>

      {stats && <StatsRow stats={stats} />}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search entries…"
          className="sm:max-w-xs"
        />
        <Input
          value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
          placeholder="Filter by tech tag…"
          className="sm:max-w-48"
        />
        <Select
          value={type || ALL_TYPES}
          onValueChange={(value) =>
            updateParam("type", !value || value === ALL_TYPES ? "" : value)
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TYPES}>All types</SelectItem>
            {ENTRY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {ENTRY_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          aria-label={sort === "desc" ? "Sort oldest first" : "Sort newest first"}
          onClick={() => updateParam("sort", sort === "desc" ? "asc" : "desc")}
        >
          {sort === "desc" ? (
            <ArrowDownAZ className="size-4" />
          ) : (
            <ArrowUpAZ className="size-4" />
          )}
        </Button>
        <Button variant="outline" onClick={handleExport} disabled={exporting} className="sm:hidden">
          <Download className="size-4" />
          {exporting ? "Exporting…" : "Export"}
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            {q || type || tech
              ? "No entries match your filters."
              : "No entries yet — log your first piece of work."}
          </p>
          {!q && !type && !tech && (
            <Link href="/entries/new" className={cn(buttonVariants())}>
              Add your first entry
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              onClick={handlePreviousPage}
              disabled={pageIndex === 0 || loading}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pageIndex + 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              onClick={handleNextPage}
              disabled={!nextCursor || loading}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </>
      )}

      <AddEntryFab />
    </div>
  );
}
