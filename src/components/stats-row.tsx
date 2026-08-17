import { Card } from "@/components/ui/card";
import { ENTRY_TYPE_LABELS } from "@/lib/entry-type-styles";
import { ENTRY_TYPES } from "@/lib/validations/entry";
import { cn } from "@/lib/utils";
import type { EntryType } from "@/lib/types";

type Stats = {
  total: number;
  byType: { type: EntryType; count: number }[];
  topTags: { tag: string; count: number }[];
};

export function StatsRow({ stats }: { stats: Stats }) {
  const countByType = new Map(stats.byType.map((row) => [row.type, row.count]));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Total entries" value={stats.total} emphasis />
        {ENTRY_TYPES.map((type) => (
          <StatTile
            key={type}
            label={ENTRY_TYPE_LABELS[type]}
            value={countByType.get(type) ?? 0}
          />
        ))}
      </div>

      {stats.topTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Most used:</span>
          {stats.topTags.map(({ tag, count }) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tag} <span className="text-foreground/70">× {count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <Card
      className={cn(
        "gap-1 px-4 py-3",
        emphasis && "border-primary/30 bg-primary/5",
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-heading text-2xl font-semibold",
          emphasis && "text-primary",
        )}
      >
        {value}
      </span>
    </Card>
  );
}
