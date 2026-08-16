import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { ArrowRight, Copy, Lock, Search, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/logo-mark";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Smartphone,
    title: "Log in seconds",
    description:
      "A tap-friendly form and a floating shortcut mean you can capture what you built before you forget it.",
  },
  {
    icon: Search,
    title: "Find anything later",
    description:
      "Filter by type, tech tag, or keyword when you need proof of what you actually shipped.",
  },
  {
    icon: Lock,
    title: "Yours alone",
    description:
      "Every entry is private to your account. Nobody else can see, search, or edit your log.",
  },
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="relative flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -z-10 size-144 -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-3xl"
      />

      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <span className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
            <LogoMark className="size-6 text-primary" />
            Logger
          </span>
          <nav className="flex items-center gap-2">
            {userId ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "ghost" }))}
                >
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={cn(buttonVariants({ variant: "ghost" }))}
                >
                  Sign in
                </Link>
                <Link href="/sign-up" className={cn(buttonVariants())}>
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <section className="flex w-full max-w-2xl flex-col items-center gap-5 px-6 py-20 text-center">
          <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Your engineering work, remembered
          </span>
          <h1 className="font-heading text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Logger
          </h1>
          <p className="text-lg text-balance text-muted-foreground">
            Keep a running log of every feature, bug fix, and improvement you
            ship at work - then turn it into resume bullets and interview
            stories whenever you need them.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            {userId ? (
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Get started
                </Link>
                <Link
                  href="/sign-in"
                  className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="w-full max-w-4xl px-6 pb-20">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col gap-2 rounded-xl border border-dashed bg-card/50 p-5">
              <span className="text-xs font-medium text-muted-foreground">
                What you typed
              </span>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;migrated the auth flow off sessions onto jwt. was
                getting random 500s in prod for like 2 weeks, finally traced
                it to the session store timing out under load.&rdquo;
              </p>
            </div>

            <div className="flex justify-center text-muted-foreground/60">
              <ArrowRight className="size-5 -rotate-90 md:rotate-0" />
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary">
                  Resume bullet
                </span>
                <Copy className="size-3.5 text-muted-foreground" />
              </div>
              <p className="text-sm">
                Migrated authentication from session-based to JWT,
                eliminating a recurring production outage affecting thousands
                of daily users.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-4xl border-t px-6 py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col gap-2">
                <Icon className="size-5 text-primary" />
                <h2 className="font-heading text-sm font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          <Badge variant="outline" className="mr-2 align-middle">
            Logger
          </Badge>
          Built for developers who forget what they built.
        </p>
      </footer>
    </div>
  );
}
