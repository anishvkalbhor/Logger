"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Briefcase,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  MapPin,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProfileDTO } from "@/lib/types";

type FormState = {
  name: string;
  experience: string;
  location: string;
  skills: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
};

function toFormState(profile: ProfileDTO, fallbackName: string): FormState {
  return {
    name: profile.name ?? fallbackName,
    experience: profile.experience ?? "",
    location: profile.location ?? "",
    skills: profile.skills.join(", "),
    bio: profile.bio ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    websiteUrl: profile.websiteUrl ?? "",
  };
}

function isProfileEmpty(profile: ProfileDTO) {
  return (
    !profile.name &&
    !profile.experience &&
    !profile.location &&
    profile.skills.length === 0 &&
    !profile.bio &&
    !profile.githubUrl &&
    !profile.linkedinUrl &&
    !profile.websiteUrl
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [values, setValues] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data: ProfileDTO) => {
        if (cancelled) return;
        setProfile(data);
        if (isProfileEmpty(data)) setMode("edit");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function startEditing() {
    if (!profile) return;
    setValues(toFormState(profile, user?.fullName ?? ""));
    setMode("edit");
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!values) return;

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          skills: values.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        toast.error("Couldn't save your profile.");
        return;
      }
      const updated = await res.json();
      setProfile(updated);
      setMode("view");
      toast.success("Profile saved");
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/profile/resume", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(
          body?.error === "Invalid request" ? body.details : "Couldn't upload resume.",
        );
        return;
      }
      setProfile(await res.json());
      toast.success("Resume uploaded");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleResumeRemove() {
    setUploading(true);
    try {
      const res = await fetch("/api/profile/resume", { method: "DELETE" });
      if (!res.ok) {
        toast.error("Couldn't remove resume.");
        return;
      }
      setProfile(await res.json());
      toast.success("Resume removed");
    } finally {
      setUploading(false);
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Profile
          </h1>
          <p className="text-muted-foreground">
            How you show up for interview prep.
          </p>
        </div>
        {mode === "view" && (
          <Button variant="outline" onClick={startEditing}>
            <Pencil className="size-4" />
            Edit profile
          </Button>
        )}
      </div>

      {mode === "view" ? (
        <ProfileView
          profile={profile}
          avatarUrl={user?.imageUrl}
          onUploadResume={() => fileInputRef.current?.click()}
        />
      ) : (
        values && (
          <ProfileForm
            values={values}
            saving={saving}
            uploading={uploading}
            profile={profile}
            onChange={set}
            onSubmit={handleSave}
            onCancel={() => setMode(isProfileEmpty(profile) ? "edit" : "view")}
            onUploadClick={() => fileInputRef.current?.click()}
            onResumeRemove={handleResumeRemove}
          />
        )
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleResumeUpload(file);
        }}
      />
    </div>
  );
}

function ProfileView({
  profile,
  avatarUrl,
  onUploadResume,
}: {
  profile: ProfileDTO;
  avatarUrl?: string;
  onUploadResume: () => void;
}) {
  const links = [
    { href: profile.githubUrl, label: "GitHub", icon: Link2 },
    { href: profile.linkedinUrl, label: "LinkedIn", icon: Link2 },
    { href: profile.websiteUrl, label: "Website", icon: Globe },
  ].filter((link): link is typeof link & { href: string } => Boolean(link.href));

  return (
    <div className="flex flex-col gap-6">
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
            {(profile.name ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2 className="font-heading text-xl font-semibold">
            {profile.name || "Add your name"}
          </h2>
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
          <h3 className="text-sm font-medium text-muted-foreground">Skills</h3>
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
          <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
          <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-xl border p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Resume</h3>
        {profile.resumeUrl ? (
          <a
            href="/api/profile/resume"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <FileText className="size-4 text-primary" />
            <span className="truncate">{profile.resumeName}</span>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </a>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">No resume uploaded.</p>
            <Button variant="outline" size="sm" onClick={onUploadResume}>
              <Upload className="size-4" />
              Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileForm({
  values,
  saving,
  uploading,
  profile,
  onChange,
  onSubmit,
  onCancel,
  onUploadClick,
  onResumeRemove,
}: {
  values: FormState;
  saving: boolean;
  uploading: boolean;
  profile: ProfileDTO;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  onUploadClick: () => void;
  onResumeRemove: () => void;
}) {
  const skillPreview = values.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl border p-4">
        <h2 className="font-heading text-sm font-semibold">Resume</h2>
        {profile.resumeUrl ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
            <a
              href="/api/profile/resume"
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-2 text-sm hover:underline"
            >
              <FileText className="size-4 shrink-0 text-primary" />
              <span className="truncate">{profile.resumeName}</span>
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove resume"
              onClick={onResumeRemove}
              disabled={uploading}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onUploadClick}
          disabled={uploading}
          className="self-start"
        >
          <Upload className="size-4" />
          {uploading
            ? "Uploading…"
            : profile.resumeUrl
              ? "Replace resume"
              : "Upload resume"}
        </Button>
        <p className="text-xs text-muted-foreground">
          PDF or Word document, up to 5MB.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="experience">Experience</Label>
          <Input
            id="experience"
            value={values.experience}
            onChange={(e) => onChange("experience", e.target.value)}
            placeholder="e.g. Senior Software Engineer, 5 yrs"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={values.location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="e.g. San Francisco, CA (Remote)"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          value={values.skills}
          onChange={(e) => onChange("skills", e.target.value)}
          placeholder="React, Node.js, PostgreSQL"
        />
        {skillPreview.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skillPreview.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={values.bio}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="A short professional summary"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="githubUrl">GitHub</Label>
        <Input
          id="githubUrl"
          value={values.githubUrl}
          onChange={(e) => onChange("githubUrl", e.target.value)}
          placeholder="https://github.com/yourname"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="linkedinUrl">LinkedIn</Label>
        <Input
          id="linkedinUrl"
          value={values.linkedinUrl}
          onChange={(e) => onChange("linkedinUrl", e.target.value)}
          placeholder="https://linkedin.com/in/yourname"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="websiteUrl">Website / portfolio</Label>
        <Input
          id="websiteUrl"
          value={values.websiteUrl}
          onChange={(e) => onChange("websiteUrl", e.target.value)}
          placeholder="https://yourname.dev"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
