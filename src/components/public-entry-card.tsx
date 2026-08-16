import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ENTRY_TYPE_LABELS } from "@/components/entry-form";
import type { EntryDTO } from "@/lib/types";

type PublicEntryData = Pick<
  EntryDTO,
  "id" | "title" | "type" | "whatIDid" | "techTags" | "impact" | "publicSummary"
> & { date: string | Date };

export function PublicEntryCard({ entry }: { entry: PublicEntryData }) {
  const date = new Date(entry.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const description = entry.publicSummary || entry.whatIDid;

  return (
    <Card className="h-full gap-3 py-4">
      <CardHeader className="gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{ENTRY_TYPE_LABELS[entry.type]}</Badge>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <CardTitle className="text-base">{entry.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
          {description}
        </p>
        {entry.impact && (
          <p className="rounded-lg bg-primary/5 px-3 py-2 text-sm text-primary">
            {entry.impact}
          </p>
        )}
        {entry.techTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.techTags.map((tag) => (
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
}
