"use client";

import type { ComponentProps } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

type ClerkAppearance = ComponentProps<typeof ClerkProvider>["appearance"];

export function ClerkThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  // @clerk/themes ships its own (older) type declarations for `dark`, which
  // TypeScript treats as incompatible with @clerk/nextjs's `appearance` prop
  // even though the underlying shape is identical at runtime.
  const appearance = {
    baseTheme: resolvedTheme === "dark" ? dark : undefined,
    variables: { colorPrimary: "#171717" },
  } as ClerkAppearance;

  return (
    <ClerkProvider afterSignOutUrl="/" appearance={appearance}>
      {children}
    </ClerkProvider>
  );
}
