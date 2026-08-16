"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { buildResumeBullet, type BulletSource } from "@/lib/resume-bullet";

export function CopyBulletButton({ entry }: { entry: BulletSource }) {
  async function handleCopy() {
    const bullet = buildResumeBullet(entry);
    try {
      await navigator.clipboard.writeText(bullet);
      toast.success("Resume bullet copied to clipboard");
    } catch {
      toast.error("Couldn't copy — check clipboard permissions.");
    }
  }

  return (
    <Button variant="outline" onClick={handleCopy}>
      <Copy className="size-4" />
      Copy resume bullet
    </Button>
  );
}
