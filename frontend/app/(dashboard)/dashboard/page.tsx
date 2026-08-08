"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  PlusCircle,
  Briefcase,
  TrendingUp,
  Award,
  XCircle,
  Brain,
  ArrowRight,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { api, type Job } from "@/lib/api";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon: Icon,
  color = "primary",
  suffix,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color?: "primary" | "emerald" | "amber" | "red";
  suffix?: string;
}) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="card-premium p-5 flex items-start gap-4">
      <div className={cn("h-10 w-10 rounded-lg border flex items-center justify-center shrink-0", colorMap[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">
          {value}{suffix}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SAVED: "bg-muted text-muted-foreground",
    ANALYZING: "bg-amber-500/15 text-amber-400",
    READY_TO_APPLY: "bg-primary/15 text-primary",
    APPLIED: "bg-blue-500/15 text-blue-400",
    INTERVIEW: "bg-emerald-500/15 text-emerald-400",
    TECHNICAL_INTERVIEW: "bg-emerald-500/15 text-emerald-400",
    FINAL_INTERVIEW: "bg-emerald-500/15 text-emerald-400",
    OFFER: "bg-emerald-500/20 text-emerald-300 font-semibold",
    REJECTED: "bg-red-500/15 text-red-400",
  };

  const labels: Record<string, string> = {
    SAVED: "Saved",
    ANALYZING: "Analyzing",
    READY_TO_APPLY: "Ready",
    APPLIED: "Applied",
    RECRUITER_CONTACT: "Recruiter",
    SCREENING: "Screening",
    INTERVIEW: "Interview",
    TECHNICAL_INTERVIEW: "Tech Interview",
    FINAL_INTERVIEW: "Final Interview",
    OFFER: "🎉 Offer",
    REJECTED: "Rejected",
  };

  return (
    <span
      className={cn(
        "inline-flex text-[11px] px-2 py-0.5 rounded-full font-medium",
        map[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: api.applications.getStats,
    retry: false,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.jobs.list,
    retry: false,
  });

  const { data: candidate } = useQuery({
    queryKey: ["candidate"],
    queryFn: api.career.getProfile,
    retry: false,
  });

  const recentJobs = jobs?.slice(0, 5) ?? [];
  const highMatchJobs = jobs
    ?.filter((j) => j.jobMatch && j.jobMatch.overallScore >= 80)
    .sort((a, b) => (b.jobMatch?.overallScore ?? 0) - (a.jobMatch?.overallScore ?? 0))
    .slice(0, 3) ?? [];

  const noProfile = !candidate && !statsLoading;
  const noJobs = !jobsLoading && jobs?.length === 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {candidate ? `Welcome back, ${candidate.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your career intelligence at a glance
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

      {/* Onboarding prompt */}
      {noProfile && (
        <div className="card-premium p-6 gradient-border">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Build your Career Brain</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Import your resume to get started. CareerPilot will extract your experience, projects, and skills.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline"
              >
                Import Resume <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Jobs Tracked"
          value={stats?.totalJobs ?? 0}
          icon={Briefcase}
          color="primary"
        />
        <StatCard
          label="Applications"
          value={stats?.interviews ?? 0}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          label="Offer Rate"
          value={stats?.offerRate ?? 0}
          icon={Award}
          color="amber"
          suffix="%"
        />
        <StatCard
          label="Rejections"
          value={stats?.rejections ?? 0}
          icon={XCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Jobs
            </h2>
            <Link href="/jobs" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>

          {noJobs ? (
            <div className="card-premium p-8 text-center">
              <Brain className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No jobs yet</p>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-1.5 mt-2 text-sm text-primary hover:underline"
              >
                Analyze your first job <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="card-premium p-4 flex items-center gap-4 hover:border-primary/30 transition-colors block"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {job.company}
                      {job.location ? ` · ${job.location}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {job.jobMatch && (
                      <span
                        className={cn(
                          "text-sm font-bold",
                          job.jobMatch.overallScore >= 80
                            ? "score-excellent"
                            : job.jobMatch.overallScore >= 65
                            ? "score-good"
                            : "score-fair"
                        )}
                      >
                        {Math.round(job.jobMatch.overallScore)}%
                      </span>
                    )}
                    <JobStatusBadge status={job.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* High match jobs */}
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-400" />
              High Match Jobs
            </h2>
            {highMatchJobs.length === 0 ? (
              <div className="card-premium p-4 text-center">
                <Target className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Analyze jobs to see match scores
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {highMatchJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}/analysis`}
                    className="card-premium p-3 flex items-center gap-3 hover:border-primary/30 transition-colors block"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {job.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {job.company}
                      </p>
                    </div>
                    <span className="text-sm font-bold score-excellent shrink-0">
                      {Math.round(job.jobMatch?.overallScore ?? 0)}%
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/jobs/new"
                className="card-premium p-3 flex items-center gap-3 hover:border-primary/30 transition-colors block"
              >
                <PlusCircle className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">Analyze New Job</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </Link>
              <Link
                href="/career"
                className="card-premium p-3 flex items-center gap-3 hover:border-primary/30 transition-colors block"
              >
                <Brain className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">Edit Career Profile</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
