"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Globe,
  Pencil,
  Check,
  X,
  Briefcase,
  FolderOpen,
  Wrench,
  GraduationCap,
  Trophy,
  HelpCircle,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import Link from "next/link";
import { api, type Candidate } from "@/lib/api";

export default function CareerProfilePage() {
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate"],
    queryFn: api.career.getProfile,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Candidate>) => api.career.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setEditingField(null);
    },
  });

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value ?? "");
  };

  const saveEdit = (field: string) => {
    updateMutation.mutate({ [field]: editValue || null });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="card-premium p-6 space-y-3">
            <div className="h-5 bg-muted rounded w-64" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="card-premium p-8 text-center">
          <User className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-foreground mb-2">
            No Career Profile
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Import your resume to build your Career Brain.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Import Resume
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    {
      href: "/career/experience",
      label: "Work Experience",
      count: candidate.experiences?.length ?? 0,
      icon: Briefcase,
    },
    {
      href: "/career/projects",
      label: "Projects",
      count: candidate.projects?.length ?? 0,
      icon: FolderOpen,
    },
    {
      href: "/career/skills",
      label: "Skills",
      count: candidate.skills?.length ?? 0,
      icon: Wrench,
    },
    {
      href: "/career/education",
      label: "Education",
      count: candidate.educations?.length ?? 0,
      icon: GraduationCap,
    },
    {
      href: "/career/questions",
      label: "Application Q&A Bank",
      count: candidate.profileAnswers?.length ?? 0,
      icon: HelpCircle,
    },
  ];

  const editableField = (
    field: keyof Candidate,
    label: string,
    icon: React.ElementType,
    type: string = "text"
  ) => {
    const Icon = icon;
    const isEditing = editingField === field;
    const value = candidate[field] as string | null | undefined;

    return (
      <div className="flex items-start gap-3 group">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">
            {label}
          </p>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 bg-input border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(field);
                  if (e.key === "Escape") setEditingField(null);
                }}
              />
              <button
                onClick={() => saveEdit(field)}
                className="h-8 w-8 rounded-lg bg-primary/15 hover:bg-primary/25 flex items-center justify-center"
              >
                <Check className="h-3.5 w-3.5 text-primary" />
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="h-8 w-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEdit(field, value ?? "")}
              className="flex items-center gap-2 group/btn text-left w-full"
            >
              <span className={`text-sm ${value ? "text-foreground" : "text-muted-foreground/40 italic"}`}>
                {value ?? `Add ${label.toLowerCase()}`}
              </span>
              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/btn:opacity-100 transition-opacity shrink-0" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Career Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your verified career knowledge base — the source of truth for all AI generation.
        </p>
      </div>

      {/* Profile card */}
      <div className="card-premium p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            {editingField === "name" ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 bg-input border border-border rounded-lg px-3 py-1.5 text-lg font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit("name");
                    if (e.key === "Escape") setEditingField(null);
                  }}
                />
                <button onClick={() => saveEdit("name")} className="h-8 w-8 rounded-lg bg-primary/15 hover:bg-primary/25 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </button>
                <button onClick={() => setEditingField(null)} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startEdit("name", candidate.name)}
                className="flex items-center gap-2 group/name text-left"
              >
                <h2 className="text-xl font-bold text-foreground">{candidate.name}</h2>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Member since {new Date(candidate.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {editableField("email", "Email", Mail, "email")}
          {editableField("phone", "Phone", Phone)}
          {editableField("location", "Location", MapPin)}
          {editableField("portfolioUrl", "Portfolio", Globe, "url")}
          {editableField("githubUrl", "GitHub", GithubIcon, "url")}
          {editableField("linkedinUrl", "LinkedIn", LinkedinIcon, "url")}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider mb-2">
            Professional Summary
          </p>
          {editingField === "professionalSummary" ? (
            <div className="space-y-2">
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={4}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => saveEdit("professionalSummary")} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                  Save
                </button>
                <button onClick={() => setEditingField(null)} className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => startEdit("professionalSummary", candidate.professionalSummary ?? "")}
              className="group/summary w-full text-left"
            >
              <p className={`text-sm leading-relaxed ${candidate.professionalSummary ? "text-foreground" : "text-muted-foreground/40 italic"}`}>
                {candidate.professionalSummary ?? "Click to add a professional summary..."}
              </p>
              <span className="text-xs text-primary opacity-0 group-hover/summary:opacity-100 transition-opacity mt-1 inline-flex items-center gap-1">
                <Pencil className="h-3 w-3" /> Edit summary
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map(({ href, label, count, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="card-premium p-4 flex items-center justify-between group hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{count} entries</p>
              </div>
            </div>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              Manage & Add →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
