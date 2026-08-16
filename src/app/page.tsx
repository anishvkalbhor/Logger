import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FileText, ListFilter, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: "Log it in seconds",
    description: "Quick-add from your phone the moment you ship something.",
  },
  {
    icon: ListFilter,
    title: "Search & filter",
    description: "Find anything by type, tech tag, or keyword later on.",
  },
  {
    icon: FileText,
    title: "Export resume bullets",
    description: "Turn any entry into a clean, ready-to-paste bullet point.",
  },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -z-10 size-144 -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24 text-center">
        <div className="flex max-w-xl flex-col items-center gap-5">
          <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Your engineering work, remembered
          </span>
          <h1 className="font-heading text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Logger
          </h1>
          <p className="text-lg text-balance text-muted-foreground">
            Keep a running log of every feature, bug fix, and improvement you
            ship at work — then turn it into resume bullets and interview
            stories whenever you need them.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }))}>
            Get started
          </Link>
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Sign in
          </Link>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 pt-8 text-left sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-xl border bg-card p-4"
            >
              <Icon className="size-5 text-primary" />
              <h2 className="font-heading text-sm font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
