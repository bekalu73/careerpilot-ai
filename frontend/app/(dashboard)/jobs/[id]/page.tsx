"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Brain,
  Zap,
  FileText,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Briefcase,
  FolderOpen,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn, formatDate, getScoreColor, getScoreLabel } from "@/lib/utils";

const STATUS_OPTIONS = [
  "SAVED", "ANALYZING", "READY_TO_APPLY", "APPLIED", "RECRUITER_CONTACT",
  "SCREENING", "INTERVIEW", "TECHNICAL_INTERVIEW", "FINAL_INTERVIEW", "OFFER", "REJECTED",
] as const;

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved",
  ANALYZING: "Analyzing",
  READY_TO_APPLY: "Ready to Apply",
  APPLIED: "Applied",
  RECRUITER_CONTACT: "Recruiter Contact",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  TECHNICAL_INTERVIEW: "Technical Interview",
  FINAL_INTERVIEW: "Final Interview",
  OFFER: "🎉 Offer Received",
  REJECTED: "Rejected",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-semibold", getScoreColor(score))}>
          {Math.round(score)}%
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score >= 85 ? "bg-emerald-400" :
            score >= 70 ? "bg-primary" :
            score >= 55 ? "bg-amber-400" : "bg-red-400"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function JobWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api.jobs.get(id),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => api.jobs.analyze(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job", id] }),
  });

  const matchMutation = useMutation({
    mutationFn: () => api.jobs.match(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job", id] }),
  });

  const generateMutation = useMutation({
    mutationFn: () => api.jobs.generate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job", id] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      api.applications.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job", id] }),
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium p-5 h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="card-premium p-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Job not found.</p>
        </div>
      </div>
    );
  }

  const match = job.jobMatch;
  const hasDocuments = (job as any).documents?.length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {job.title}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.company}
            </span>
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(job.createdAt)}
            </span>
            {job.applicationUrl && (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Apply
              </a>
            )}
          </div>
        </div>

        {/* Status selector */}
        <select
          value={job.status}
          onChange={(e) => updateStatusMutation.mutate(e.target.value)}
          className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Match Score Hero */}
      {match ? (
        <div className="card-premium p-6 gradient-border">
          <div className="flex items-start gap-6">
            {/* Overall score */}
            <div className="text-center shrink-0">
              <div
                className={cn(
                  "text-5xl font-bold leading-none",
                  getScoreColor(match.overallScore)
                )}
              >
                {Math.round(match.overallScore)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1.5 uppercase tracking-wider">
                Overall Match
              </div>
              <div
                className={cn(
                  "text-xs font-semibold mt-0.5",
                  getScoreColor(match.overallScore)
                )}
              >
                {getScoreLabel(match.overallScore)}
              </div>
            </div>

            {/* Score breakdown */}
            <div className="flex-1 space-y-3">
              <ScoreBar label="Technical Match" score={match.technicalScore} />
              <ScoreBar label="Experience Match" score={match.experienceScore} />
              <ScoreBar label="Project Match" score={match.projectScore} />
              <ScoreBar label="Seniority Match" score={match.seniorityScore} />
              <ScoreBar label="Domain Match" score={match.domainScore} />
            </div>
          </div>

          {match.explanation && (
            <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border/50 leading-relaxed">
              {match.explanation}
            </p>
          )}

          {/* Strong matches + gaps */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {match.strongMatches.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  ✓ Strong Matches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.strongMatches.map((m) => (
                    <span
                      key={m}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {match.potentialGaps.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  △ Potential Gaps
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.potentialGaps.map((g) => (
                    <span
                      key={g}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card-premium p-6 text-center">
          <Brain className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            No match analysis yet
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {job.isAnalyzed
              ? "Run candidate matching to see your match score."
              : "Analyze the job description first, then run matching."}
          </p>
          {!job.isAnalyzed ? (
            <button
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending || !job.description}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {analyzeMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</>
              ) : (
                <><Zap className="h-4 w-4" />Analyze Job</>
              )}
            </button>
          ) : (
            <button
              onClick={() => matchMutation.mutate()}
              disabled={matchMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {matchMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Matching...</>
              ) : (
                <><Brain className="h-4 w-4" />Calculate Match</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Selected Projects */}
      {match?.matchedProjects && match.matchedProjects.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Recommended Projects
          </h2>
          <div className="space-y-2">
            {match.matchedProjects
              .sort((a, b) => a.rankOrder - b.rankOrder)
              .map((mp, index) => (
                <div key={mp.id} className="card-premium p-4 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">
                        {mp.project.name}
                      </h3>
                      <span className={cn("text-xs font-bold", getScoreColor(mp.relevanceScore))}>
                        {Math.round(mp.relevanceScore)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {mp.reason}
                    </p>
                    {mp.project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mp.project.technologies.slice(0, 4).map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {!match ? (
          <button
            onClick={() => job.isAnalyzed ? matchMutation.mutate() : analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending || matchMutation.isPending}
            className="card-premium p-4 text-center hover:border-primary/30 transition-colors disabled:opacity-50"
          >
            <Brain className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <p className="text-sm font-medium text-foreground">
              {job.isAnalyzed ? "Match Candidate" : "Analyze Job"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {job.isAnalyzed ? "Calculate match score" : "Extract requirements"}
            </p>
          </button>
        ) : (
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="card-premium p-4 text-center hover:border-primary/30 transition-all border-primary/20 bg-primary/5 disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-5 w-5 text-primary mx-auto mb-1.5 animate-spin" />
            ) : (
              <Zap className="h-5 w-5 text-primary mx-auto mb-1.5" />
            )}
            <p className="text-sm font-semibold text-primary">
              {generateMutation.isPending ? "Generating..." : "Generate Application"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Resume + Cover Letter + Messages
            </p>
          </button>
        )}

        <Link
          href={`/jobs/${id}/analysis`}
          className="card-premium p-4 text-center hover:border-primary/30 transition-colors block"
        >
          <Brain className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
          <p className="text-sm font-medium text-foreground">Job Analysis</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Requirements & keywords
          </p>
        </Link>

        <Link
          href={`/jobs/${id}/application`}
          className="card-premium p-4 text-center hover:border-primary/30 transition-colors block"
        >
          <FileText className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
          <p className="text-sm font-medium text-foreground">Application Package</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasDocuments ? "View generated documents" : "Not generated yet"}
          </p>
        </Link>
      </div>

      {/* Job description preview */}
      {job.description && (
        <div className="card-premium p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Job Description
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-8">
            {job.description}
          </p>
        </div>
      )}
    </div>
  );
}
