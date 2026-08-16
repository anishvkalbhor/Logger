"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTRY_TYPES, entryInputSchema } from "@/lib/validations/entry";
import type { EntryDTO, EntryType } from "@/lib/types";

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  FEATURE: "Feature",
  BUG_FIX: "Bug Fix",
  IMPROVEMENT: "Improvement",
  TECH_DEBT: "Tech Debt",
  OTHER: "Other",
};

function toDateInputValue(date: string | Date) {
  return new Date(date).toISOString().slice(0, 10);
}

type FormState = {
  title: string;
  type: EntryType;
  date: string;
  problemContext: string;
  whatIDid: string;
  techTags: string;
  impact: string;
  challenges: string;
  referenceLink: string;
};

function toFormState(entry?: EntryDTO): FormState {
  return {
    title: entry?.title ?? "",
    type: entry?.type ?? "FEATURE",
    date: entry ? toDateInputValue(entry.date) : toDateInputValue(new Date()),
    problemContext: entry?.problemContext ?? "",
    whatIDid: entry?.whatIDid ?? "",
    techTags: entry?.techTags?.join(", ") ?? "",
    impact: entry?.impact ?? "",
    challenges: entry?.challenges ?? "",
    referenceLink: entry?.referenceLink ?? "",
  };
}

export function EntryForm({
  entry,
  mode,
}: {
  entry?: EntryDTO;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(() => toFormState(entry));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = entryInputSchema.safeParse({
      ...values,
      techTags: values.techTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/entries" : `/api/entries/${entry!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        toast.error("Something went wrong saving this entry.");
        return;
      }

      const saved = await res.json();
      toast.success(mode === "create" ? "Entry created" : "Entry updated");
      router.push(`/entries/${saved.id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const tagPreview = values.techTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-24 sm:pb-0">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Added CSV export to reports page"
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <Select
            value={values.type}
            onValueChange={(value) => set("type", value as EntryType)}
          >
            <SelectTrigger id="type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTRY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {ENTRY_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            aria-invalid={!!errors.date}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="problemContext">Problem / Context</Label>
        <Textarea
          id="problemContext"
          value={values.problemContext}
          onChange={(e) => set("problemContext", e.target.value)}
          placeholder="Why was this needed?"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="whatIDid">What I did</Label>
        <Textarea
          id="whatIDid"
          value={values.whatIDid}
          onChange={(e) => set("whatIDid", e.target.value)}
          placeholder="Technical summary of the work"
          rows={4}
          aria-invalid={!!errors.whatIDid}
        />
        {errors.whatIDid && (
          <p className="text-sm text-destructive">{errors.whatIDid}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="techTags">Tech / Tools used</Label>
        <Input
          id="techTags"
          value={values.techTags}
          onChange={(e) => set("techTags", e.target.value)}
          placeholder="React, Next.js, Postgres"
        />
        {tagPreview.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tagPreview.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="impact">Impact / Result</Label>
        <Textarea
          id="impact"
          value={values.impact}
          onChange={(e) => set("impact", e.target.value)}
          placeholder="Metrics or outcomes (optional)"
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="challenges">Challenges / Decisions</Label>
        <Textarea
          id="challenges"
          value={values.challenges}
          onChange={(e) => set("challenges", e.target.value)}
          placeholder="Tradeoffs, decisions made (optional)"
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="referenceLink">Ticket / Reference link</Label>
        <Input
          id="referenceLink"
          value={values.referenceLink}
          onChange={(e) => set("referenceLink", e.target.value)}
          placeholder="https://..."
          aria-invalid={!!errors.referenceLink}
        />
        {errors.referenceLink && (
          <p className="text-sm text-destructive">{errors.referenceLink}</p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background p-4 sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto flex max-w-5xl gap-3 sm:mx-0">
          <Button type="submit" disabled={submitting} className="flex-1 sm:flex-none">
            {submitting ? "Saving…" : mode === "create" ? "Save entry" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
