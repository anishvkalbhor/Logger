import Link from "next/link";
import { Plus } from "lucide-react";

export function AddEntryFab() {
  return (
    <Link
      href="/entries/new"
      aria-label="Add entry"
      className="fixed right-5 bottom-5 z-20 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:hidden"
    >
      <Plus className="size-6" />
    </Link>
  );
}
