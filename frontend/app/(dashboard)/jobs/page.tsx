"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Brain,
  PlusCircle,
  Building2,
  MapPin,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatDate, getScoreColor } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  ANALYZING: "Analyzing...",
  READY_TO_APPLY: "Ready",
  APPLIED: "Applied",
  RECRUITER_CONTACT: "Recruiter",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  TECHNICAL_INTERVIEW: "Tech Interview",
  FINAL_INTERVIEW: "Final Round",
  OFFER: "🎉 Offer",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  SAVED: "bg-muted/60 text-muted-foreground",
  ANALYZING: "bg-amber-500/15 text-amber-400",
  READY_TO_APPLY: "bg-primary/15 text-primary",
  APPLIED: "bg-blue-500/15 text-blue-400",
  RECRUITER_CONTACT: "bg-blue-500/15 text-blue-400",
  SCREENING: "bg-blue-500/15 text-blue-400",
  INTERVIEW: "bg-emerald-500/15 text-emerald-400",
  TECHNICAL_INTERVIEW: "bg-emerald-500/15 text-emerald-400",
  FINAL_INTERVIEW: "bg-emerald-500/20 text-emerald-300",
  OFFER: "bg-emerald-500/25 text-emerald-300 font-semibold",
  REJECTED: "bg-red-500/15 text-red-400",
};

export default function JobsPage() {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.jobs.list,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Analyze New Job
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-48 mb-2" />
              <div className="h-4 bg-muted rounded w-36" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-2">No jobs yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
            Paste a job description or URL and CareerPilot will analyze it, score your match, and generate a personalized application package.
          </p>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Analyze Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="card-premium p-5 flex items-center gap-5 hover:border-primary/30 transition-all duration-150 block group"
            >
              {/* Match score ring */}
              <div className="shrink-0 w-14 text-center">
                {job.jobMatch ? (
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "text-xl font-bold leading-none",
                        getScoreColor(job.jobMatch.overallScore)
                      )}
                    >
                      {Math.round(job.jobMatch.overallScore)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
                      match
                    </span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center mx-auto">
                    <TrendingUp className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Job info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {job.company}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(job.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full",
                        STATUS_COLORS[job.status] ?? "bg-muted text-muted-foreground"
                      )}
                    >
                      {STATUS_LABELS[job.status] ?? job.status}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* Tech tags */}
                {job.technologies.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {job.technologies.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                    {job.technologies.length > 5 && (
                      <span className="text-[11px] text-muted-foreground/60">
                        +{job.technologies.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
