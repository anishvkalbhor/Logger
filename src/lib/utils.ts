import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date deterministically regardless of the server's or visitor's
 * OS/browser locale. `toLocaleDateString(undefined, ...)` lets that locale
 * differ between server-render and client-hydration, which causes a
 * hydration mismatch — always pin an explicit locale for anything rendered
 * on the server.
 */
export function formatDate(date: string | Date, style: "short" | "long" = "short") {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: style,
    day: "numeric",
  })
}
