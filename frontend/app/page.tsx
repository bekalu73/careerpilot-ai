"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Upload,
  FileText,
  CheckCircle,
  Brain,
  Briefcase,
  FolderOpen,
  Wrench,
  GraduationCap,
  Trophy,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api, type ParsedResumeResult } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [parsedData, setParsedData] = useState<ParsedResumeResult | null>(null);

  const parseMutation = useMutation({
    mutationFn: api.career.importResume,
    onSuccess: (data) => {
      setParsedData(data);
      setStep("review");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: api.career.confirmImport,
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".html") && file.type !== "text/html") {
        alert("Please upload an HTML file");
        return;
      }
      const html = await file.text();
      parseMutation.mutate(html);
    },
    [parseMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleConfirm = () => {
    if (parsedData) {
      confirmMutation.mutate(parsedData.parsed);
    }
  };

  const features = [
    { icon: Briefcase, label: "Work Experience" },
    { icon: FolderOpen, label: "Projects" },
    { icon: Wrench, label: "Skills" },
    { icon: GraduationCap, label: "Education" },
    { icon: Trophy, label: "Achievements" },
  ];

  const parsed = parsedData?.parsed;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 mb-4">
            <Rocket className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text mb-2">
            Welcome to CareerPilot
          </h1>
          <p className="text-muted-foreground text-base">
            Let's build your Career Brain — your personal career intelligence engine.
          </p>
        </div>

        {step === "upload" && (
          <div className="card-premium p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Import Your Resume
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload your <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">resume.html</code> file.
                CareerPilot will extract your career data using Gemini AI.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
                ${dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
                }
              `}
            >
              <input
                type="file"
                accept=".html,text/html"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="resume-upload"
              />

              {parseMutation.isPending ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Gemini is extracting your career data...
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    This may take 15–30 seconds
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center">
                    <Upload className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drop resume.html here or{" "}
                      <span className="text-primary">click to browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      HTML format only
                    </p>
                  </div>
                </div>
              )}
            </div>

            {parseMutation.isError && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">
                  Failed to parse resume. Check that your Gemini API key is configured in the backend .env file.
                </p>
              </div>
            )}

            {/* What gets extracted */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                CareerPilot will extract
              </p>
              <div className="flex flex-wrap gap-2">
                {features.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground"
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "review" && parsed && (
          <div className="card-premium p-8 space-y-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  We found your career data!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review what Gemini extracted before saving to your Career Brain.
                </p>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Work Experiences",
                  count: parsedData?.parsed.experiences?.length ?? 0,
                  icon: Briefcase,
                },
                {
                  label: "Projects",
                  count: parsedData?.parsed.projects?.length ?? 0,
                  icon: FolderOpen,
                },
                {
                  label: "Skills",
                  count: parsedData?.parsed.skills?.length ?? 0,
                  icon: Wrench,
                },
                {
                  label: "Education",
                  count: parsedData?.parsed.educations?.length ?? 0,
                  icon: GraduationCap,
                },
                {
                  label: "Achievements",
                  count: parsedData?.parsed.achievements?.length ?? 0,
                  icon: Trophy,
                },
              ].map(({ label, count, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">
                      {count}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Candidate name preview */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-0.5">Detected candidate</p>
              <p className="text-base font-semibold text-foreground">
                {parsed.candidate?.name ?? "Unknown"}
              </p>
              {parsed.candidate?.email && (
                <p className="text-sm text-muted-foreground">
                  {parsed.candidate.email}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              You will be able to review and edit all details after saving. Nothing is permanent until you confirm.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("upload")}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Re-upload
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirmMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {confirmMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Career Brain
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Already have a profile? */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have a profile?{" "}
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary hover:underline"
          >
            Go to Dashboard
          </button>
        </p>
      </div>
    </div>
  );
}
