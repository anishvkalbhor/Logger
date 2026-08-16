import Link from "next/link";
import { Globe } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ENTRY_TYPE_LABELS } from "@/components/entry-form";
import type { EntryDTO } from "@/lib/types";

type EntryCardData = Pick<
  EntryDTO,
  "id" | "title" | "type" | "whatIDid" | "techTags"
> & { date: string | Date; isPublic?: boolean };

export function EntryCard({
  entry,
  href,
}: {
  entry: EntryCardData;
  /** Pass `null` to render a plain, non-linked card (e.g. on the public portfolio page). */
  href?: string | null;
}) {
  const date = new Date(entry.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const resolvedHref = href === undefined ? `/entries/${entry.id}` : href;

  const card = (
    <Card className="h-full gap-3 py-4 transition-colors group-hover:bg-muted/50">
      <CardHeader className="gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary">{ENTRY_TYPE_LABELS[entry.type]}</Badge>
            {entry.isPublic && (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Globe className="size-3" />
                Public
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <CardTitle className="line-clamp-2 text-base">{entry.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {entry.whatIDid}
        </p>
        {entry.techTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entry.techTags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!resolvedHref) return card;

  return (
    <Link href={resolvedHref} className="group block h-full">
      {card}
    </Link>
  );
}
