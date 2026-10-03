"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ENTRY_TYPE_BADGE_CLASSES, ENTRY_TYPE_LABELS } from "@/lib/entry-type-styles";
import { MarkdownContent } from "@/components/markdown-content";
import { stripMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import type { EntryDTO } from "@/lib/types";

type PublicEntryData = Pick<
  EntryDTO,
  "id" | "title" | "type" | "whatIDid" | "techTags" | "impact" | "publicSummary"
> & { date: string | Date };

export function PublicEntryCard({ entry }: { entry: PublicEntryData }) {
  const description = entry.publicSummary || entry.whatIDid;
  const previewText = stripMarkdown(description);
  const previewImpact = entry.impact ? stripMarkdown(entry.impact) : null;

  return (
    <Dialog>
      <DialogTrigger
        nativeButton={false}
        render={
          <Card className="h-full cursor-pointer gap-3 py-4 text-left transition-colors hover:bg-muted/50" />
        }
      >
        <CardHeader className="gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="secondary"
              className={ENTRY_TYPE_BADGE_CLASSES[entry.type]}
            >
              {ENTRY_TYPE_LABELS[entry.type]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(entry.date)}
            </span>
          </div>
          <CardTitle className="line-clamp-2 text-base">{entry.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="line-clamp-4 text-sm text-muted-foreground">
            {previewText}
          </p>
          {previewImpact && (
            <p className="line-clamp-2 rounded-lg bg-primary/5 px-3 py-2 text-sm text-primary">
              {previewImpact}
            </p>
          )}
          {entry.techTags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {entry.techTags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={ENTRY_TYPE_BADGE_CLASSES[entry.type]}
            >
              {ENTRY_TYPE_LABELS[entry.type]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(entry.date)}
            </span>
          </div>
          <DialogTitle className="text-lg">{entry.title}</DialogTitle>
        </DialogHeader>

        <MarkdownContent content={description} className="text-muted-foreground" />

        {entry.impact && (
          <MarkdownContent
            content={entry.impact}
            className="rounded-lg bg-primary/5 px-3 py-2 text-primary"
          />
        )}

        {entry.techTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.techTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
