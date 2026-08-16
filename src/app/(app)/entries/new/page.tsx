import { EntryForm } from "@/components/entry-form";

export default function NewEntryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New entry</h1>
        <p className="text-muted-foreground">
          Log what you built, fixed, or improved.
        </p>
      </div>
      <EntryForm mode="create" />
    </div>
  );
}
