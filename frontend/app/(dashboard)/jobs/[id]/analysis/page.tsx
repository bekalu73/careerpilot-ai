"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Brain,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Wrench,
  Target,
  Briefcase,
  Globe,
  GraduationCap,
  Layers,
  Key,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn, getScoreColor } from "@/lib/utils";

export default function JobAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api.jobs.get(id),
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="card-premium h-64" />
      </div>
    );
  }

  if (!job?.isAnalyzed) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="card-premium p-8 text-center">
          <Brain className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Not Analyzed Yet</p>
          <p className="text-xs text-muted-foreground">
            Go to the job workspace and run "Analyze Job" first.
          </p>
          <a
            href={`/jobs/${id}`}
            className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
          >
            ← Back to workspace
          </a>
        </div>
      </div>
    );
  }

  const sections = [
    {
      icon: Wrench,
      label: "Required Skills",
      items: job.requiredSkills,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      icon: CheckCircle,
      label: "Preferred Skills",
      items: job.preferredSkills,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Target,
      label: "Technologies",
      items: job.technologies,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    {
      icon: Globe,
      label: "Domains",
      items: job.domains,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Key,
      label: "Keywords",
      items: job.keywords,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/jobs/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspace
        </Link>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Job Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {job.title} at {job.company}
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Seniority", value: job.seniority?.replace("_", " ") ?? "Not specified", icon: Layers },
          { label: "Type", value: job.employmentType?.replace("_", " ") ?? "Not specified", icon: Briefcase },
          { label: "Education Req", value: job.educationReq ?? "Not specified", icon: GraduationCap },
          { label: "Experience Req", value: job.experienceReq ?? "Not specified", icon: Target },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-premium p-4">
            <Icon className="h-4 w-4 text-muted-foreground mb-1.5" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-foreground mt-0.5 capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(({ icon: Icon, label, items, color, bg }) =>
          items.length > 0 ? (
            <div key={label} className="card-premium p-5">
              <h3 className={cn("text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5", color)}>
                <Icon className="h-3.5 w-3.5" />
                {label} ({items.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className={cn("text-[11px] px-2 py-0.5 rounded-full border", bg, color)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Responsibilities */}
      {job.requiredSkills.length === 0 && job.technologies.length === 0 && (
        <div className="card-premium p-5">
          <p className="text-sm text-muted-foreground text-center">
            No structured analysis data. The job may need to be re-analyzed.
          </p>
        </div>
      )}
    </div>
  );
}
