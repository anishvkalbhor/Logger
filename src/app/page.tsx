import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="flex max-w-xl flex-col items-center gap-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Logger
        </h1>
        <p className="text-lg text-muted-foreground">
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
    </div>
  );
}
