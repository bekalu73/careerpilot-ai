"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FileText,
  Building2,
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatDate, getScoreColor } from "@/lib/utils";

const STATUS_FLOW = [
  "SAVED", "ANALYZING", "READY_TO_APPLY", "APPLIED", "RECRUITER_CONTACT",
  "SCREENING", "INTERVIEW", "TECHNICAL_INTERVIEW", "FINAL_INTERVIEW", "OFFER",
];

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  READY_TO_APPLY: "Ready",
  APPLIED: "Applied",
  RECRUITER_CONTACT: "Recruiter",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  TECHNICAL_INTERVIEW: "Tech Interview",
  FINAL_INTERVIEW: "Final Round",
  OFFER: "🎉 Offer",
  REJECTED: "❌ Rejected",
};

export default function ApplicationsPage() {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: api.applications.list,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: api.applications.getStats,
    retry: false,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track every application from submission to offer.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Applied", value: stats.applied, color: "text-primary" },
            { label: "Interviews", value: stats.interviews, color: "text-emerald-400" },
            { label: "Interview Rate", value: `${stats.interviewRate}%`, color: "text-amber-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-premium p-4 text-center">
              <p className={cn("text-2xl font-bold", color)}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-2">No applications yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            Applications are automatically created when you update a job's status to "Applied".
          </p>
          <Link href="/jobs" className="text-sm text-primary hover:underline">
            View jobs →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/applications/${app.id}`}
              className="card-premium p-5 flex items-center gap-4 hover:border-primary/30 transition-colors block group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {app.job?.title ?? "Unknown Job"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {app.job?.company ?? "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {app.appliedAt
                          ? `Applied ${formatDate(app.appliedAt)}`
                          : `Created ${formatDate(app.createdAt)}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {app.job?.jobMatch && (
                      <span className={cn("text-sm font-bold", getScoreColor(app.job.jobMatch.overallScore))}>
                        {Math.round(app.job.jobMatch.overallScore)}%
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-full">
                      {STATUS_LABELS[app.job?.status ?? "SAVED"] ?? app.job?.status}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
