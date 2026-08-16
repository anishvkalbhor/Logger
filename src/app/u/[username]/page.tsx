import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { Briefcase, ExternalLink, FileText, Globe, Link2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PublicEntryCard } from "@/components/public-entry-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ username: string }> };

async function getPublicProfile(username: string) {
  const profile = await prisma.profile.findUnique({ where: { username } });
  if (!profile) return null;

  const entries = await prisma.entry.findMany({
    where: { userId: profile.userId, isPublic: true },
    orderBy: { date: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      date: true,
      whatIDid: true,
      publicSummary: true,
      techTags: true,
      impact: true,
    },
  });

  let avatarUrl: string | undefined;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(profile.userId);
    avatarUrl = user.imageUrl;
  } catch {
    avatarUrl = undefined;
  }

  return { profile, entries, avatarUrl };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) return { title: "Profile not found" };

  const displayName = data.profile.name || username;
  return {
    title: `${displayName}'s Engineering Log`,
    description:
      data.profile.bio || `Public engineering work log for ${displayName}.`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const data = await getPublicProfile(username);
  if (!data) notFound();

  const { profile, entries, avatarUrl } = data;
  const displayName = profile.name || username;

  const links = [
    { href: profile.githubUrl, label: "GitHub", icon: Link2 },
    { href: profile.linkedinUrl, label: "LinkedIn", icon: Link2 },
    { href: profile.websiteUrl, label: "Website", icon: Globe },
  ].filter((link): link is typeof link & { href: string } => Boolean(link.href));

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <span className="font-heading text-lg font-semibold tracking-tight">
            Logger
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
        <div className="flex items-start gap-4 rounded-xl border p-5">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external Clerk-hosted avatar, no local optimization needed
            <img
              src={avatarUrl}
              alt=""
              className="size-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="font-heading text-xl font-semibold">{displayName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {profile.experience && (
                <span className="flex items-center gap-1">
                  <Briefcase className="size-3.5" />
                  {profile.experience}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {profile.location}
                </span>
              )}
            </div>
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {links.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {profile.skills.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.bio && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">Bio</h2>
            <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {profile.resumeUrl && (
          <div className="flex flex-col gap-2 rounded-xl border p-4">
            <h2 className="text-sm font-medium text-muted-foreground">Resume</h2>
            <a
              href={`/api/u/${username}/resume`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <FileText className="size-4 text-primary" />
              <span className="truncate">{profile.resumeName}</span>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </a>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold">Engineering log</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No public entries yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <PublicEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
