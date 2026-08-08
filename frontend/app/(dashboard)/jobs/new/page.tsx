"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  FileText,
  Link2,
  FormInput,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type InputMethod = "paste" | "url" | "manual";

export default function NewJobPage() {
  const router = useRouter();
  const [method, setMethod] = useState<InputMethod>("paste");
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    applicationUrl: "",
    sourceUrl: "",
    location: "",
    recruiterName: "",
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: api.jobs.create,
    onSuccess: async (job) => {
      // Auto-analyze if we have a description
      if (form.description || form.sourceUrl) {
        analyzeMutation.mutate(job.id);
      } else {
        router.push(`/jobs/${job.id}`);
      }
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: api.jobs.analyze,
    onSuccess: (data) => {
      router.push(`/jobs/${data.job.id}/analysis`);
    },
    onError: (_, jobId) => {
      router.push(`/jobs/${jobId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      applicationUrl: form.applicationUrl || undefined,
      sourceUrl: form.sourceUrl || undefined,
    });
  };

  const isLoading = createMutation.isPending || analyzeMutation.isPending;

  const methods = [
    {
      id: "paste" as InputMethod,
      icon: FileText,
      label: "Paste Description",
      description: "Copy & paste the full job description",
    },
    {
      id: "url" as InputMethod,
      icon: Link2,
      label: "Job URL",
      description: "Add a URL to a public job posting",
    },
    {
      id: "manual" as InputMethod,
      icon: FormInput,
      label: "Manual Entry",
      description: "Fill in job details manually",
    },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Analyze New Job
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          CareerPilot will extract requirements, score your match, and generate a personalized application.
        </p>
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-3 gap-2">
        {methods.map(({ id, icon: Icon, label, description }) => (
          <button
            key={id}
            onClick={() => setMethod(id)}
            className={cn(
              "card-premium p-4 text-left transition-all duration-150",
              method === id
                ? "border-primary/50 bg-primary/5"
                : "hover:border-border"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 mb-2",
                method === id ? "text-primary" : "text-muted-foreground"
              )}
            />
            <p
              className={cn(
                "text-xs font-semibold",
                method === id ? "text-primary" : "text-foreground"
              )}
            >
              {label}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
              {description}
            </p>
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card-premium p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Senior React Native Developer"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Company *
            </label>
            <input
              type="text"
              required
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="e.g. Safaricom"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {method === "paste" && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Job Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={12}
              placeholder="Paste the full job description here. CareerPilot will extract all requirements, skills, and keywords..."
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        )}

        {method === "url" && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Job URL
            </label>
            <input
              type="url"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              placeholder="https://company.com/jobs/12345"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Note: Only publicly accessible job postings can be extracted. If it fails, paste the description instead.
            </p>
            <div className="mt-3">
              <label className="text-xs text-muted-foreground mb-1 block">
                Or also paste the description (recommended)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={6}
                placeholder="Paste job description as backup..."
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>
        )}

        {method === "manual" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Remote / Nairobi"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Application URL
                </label>
                <input
                  type="url"
                  value={form.applicationUrl}
                  onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Job Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={8}
                placeholder="Add job description for AI analysis..."
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Recruiter Name
              </label>
              <input
                type="text"
                value={form.recruiterName}
                onChange={(e) => setForm({ ...form, recruiterName: e.target.value })}
                placeholder="e.g. Sarah Johnson"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {(createMutation.isError || analyzeMutation.isError) && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">
              {createMutation.isError
                ? "Failed to create job. Please try again."
                : "Job saved but analysis failed. You can trigger it from the job page."}
            </p>
          </div>
        )}

        {analyzeMutation.isPending && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
            <p className="text-sm text-primary">
              Gemini is analyzing the job description... This takes 15–30 seconds.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !form.title || !form.company}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {createMutation.isPending ? "Saving..." : "Analyzing with Gemini..."}
            </>
          ) : (
            <>
              Save & Analyze Job
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
