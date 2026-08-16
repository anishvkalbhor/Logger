"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyBulletButton } from "@/components/copy-bullet-button";
import { DeleteEntryButton } from "@/components/delete-entry-button";
import { ENTRY_TYPE_LABELS } from "@/components/entry-form";
import { cn } from "@/lib/utils";
import type { EntryDTO } from "@/lib/types";

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
      <p className="whitespace-pre-wrap text-sm">{value}</p>
    </div>
  );
}

export default function EntryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<EntryDTO | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/entries/${params.id}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        setEntry(await res.json());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (notFound || !entry) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-muted-foreground">Entry not found.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const date = new Date(entry.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{ENTRY_TYPE_LABELS[entry.type]}</Badge>
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {entry.title}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/entries/${entry.id}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Pencil className="size-4" />
            Edit
          </Link>
          <DeleteEntryButton entryId={entry.id} />
        </div>
      </div>

      {entry.techTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.techTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-xl border p-4">
        <Field label="Problem / Context" value={entry.problemContext} />
        <Field label="What I did" value={entry.whatIDid} />
        <Field label="Impact / Result" value={entry.impact} />
        <Field label="Challenges / Decisions" value={entry.challenges} />
        {entry.referenceLink && (
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              Reference
            </h2>
            <a
              href={entry.referenceLink}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline underline-offset-4"
            >
              {entry.referenceLink}
            </a>
          </div>
        )}
      </div>

      <div>
        <CopyBulletButton entry={entry} />
      </div>
    </div>
  );
}
