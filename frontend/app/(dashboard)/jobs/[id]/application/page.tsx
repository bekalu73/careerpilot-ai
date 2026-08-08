"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  MessageSquare,
  Send,
  Zap,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons";
import { api, type GeneratedDocument } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ResumeDocument } from "@/components/resume-document";

type DocTab = "resume" | "cover_letter" | "linkedin" | "telegram" | "whatsapp" | "email";

const TAB_CONFIG: { id: DocTab; label: string; icon: React.ElementType; docType: string }[] = [
  { id: "cover_letter", label: "Cover Letter", icon: FileText, docType: "COVER_LETTER" },
  { id: "resume", label: "Resume", icon: FileText, docType: "RESUME" },
  { id: "linkedin", label: "LinkedIn", icon: LinkedinIcon, docType: "RECRUITER_MESSAGE_LINKEDIN" },
  { id: "telegram", label: "Telegram", icon: Send, docType: "RECRUITER_MESSAGE_TELEGRAM" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, docType: "RECRUITER_MESSAGE_WHATSAPP" },
  { id: "email", label: "Email", icon: MessageSquare, docType: "RECRUITER_MESSAGE_EMAIL" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs text-muted-foreground transition-colors"
    >
      {copied ? (
        <><Check className="h-3.5 w-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
      ) : (
        <><Copy className="h-3.5 w-3.5" />Copy</>
      )}
    </button>
  );
}

function FactCheckPanel({ doc, jobId, onRefresh }: {
  doc: GeneratedDocument;
  jobId: string;
  onRefresh: () => void;
}) {
  const factCheckMutation = useMutation({
    mutationFn: () => api.jobs.factCheck(jobId, doc.id),
    onSuccess: onRefresh,
  });

  const flaggedClaims = doc.flaggedClaims as Array<{
    claim: string;
    reason: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    suggestion: string;
  }> | null;

  if (!doc.factChecked) {
    return (
      <button
        onClick={() => factCheckMutation.mutate()}
        disabled={factCheckMutation.isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/15 transition-colors"
      >
        {factCheckMutation.isPending ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" />Fact-checking...</>
        ) : (
          <><ShieldCheck className="h-3.5 w-3.5" />Run Fact Check</>
        )}
      </button>
    );
  }

  if (doc.factCheckPassed) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
        <CheckCircle className="h-3.5 w-3.5" />
        Fact check passed - all claims verified
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        {flaggedClaims?.length ?? 0} claim(s) flagged
      </div>
      {flaggedClaims?.map((claim, i) => (
        <div
          key={i}
          className={cn(
            "p-3 rounded-lg border text-xs space-y-1.5",
            claim.severity === "HIGH"
              ? "bg-red-500/10 border-red-500/20"
              : claim.severity === "MEDIUM"
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-muted/50 border-border"
          )}
        >
          <p className={cn(
            "font-semibold",
            claim.severity === "HIGH" ? "text-red-400" :
            claim.severity === "MEDIUM" ? "text-amber-400" : "text-muted-foreground"
          )}>
            [{claim.severity}] - Unsupported claim
          </p>
          <p className="text-muted-foreground italic">"{claim.claim}"</p>
          <p className="text-muted-foreground">{claim.reason}</p>
          {claim.suggestion && (
            <p className="text-foreground/70">Suggestion: {claim.suggestion}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DocTab>("cover_letter");
  const [editingContent, setEditingContent] = useState<string | null>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api.jobs.get(id),
  });

  const { data: candidateProfile } = useQuery({
    queryKey: ["candidate-profile"],
    queryFn: () => api.career.getProfile(),
  });

  const generateMutation = useMutation({
    mutationFn: () => api.jobs.generate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job", id] }),
  });

  const generateMsgMutation = useMutation({
    mutationFn: (platform: "linkedin" | "telegram" | "whatsapp" | "email") =>
      api.jobs.generateRecruiterMessage(id, platform),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job", id] }),
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="card-premium h-64" />
      </div>
    );
  }

  const documents = (job as any)?.documents as GeneratedDocument[] | undefined;
  const hasDocuments = documents && documents.length > 0;

  const activeTab_config = TAB_CONFIG.find((t) => t.id === activeTab);
  const currentDoc = documents?.find((d) => d.type === activeTab_config?.docType);

  const renderDocContent = (doc: GeneratedDocument) => {
    if (doc.type === "RESUME") {
      return (
        <ResumeDocument
          content={doc.content}
          candidate={candidateProfile}
          jobTitle={job?.title}
          onEdit={() => setEditingContent(doc.content)}
        />
      );
    }
    return (
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {doc.content}
      </p>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Application Package
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {job?.title} at {job?.company}
          </p>
        </div>

        {!hasDocuments && (
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !job?.jobMatch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Zap className="h-4 w-4" />Generate Package</>
            )}
          </button>
        )}
      </div>

      {generateMutation.isPending && (
        <div className="card-premium p-6 text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            Generating your application package...
          </p>
          <p className="text-xs text-muted-foreground">
            Gemini is writing a personalized cover letter, resume content, and recruiter messages. This may take 30-60 seconds.
          </p>
        </div>
      )}

      {!hasDocuments && !generateMutation.isPending && (
        <div className="card-premium p-8 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No documents yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            {job?.jobMatch
              ? "Generate your personalized application package."
              : "Run candidate matching first, then generate documents."}
          </p>
          {!job?.jobMatch && (
            <a href={`/jobs/${id}`} className="text-xs text-primary hover:underline">
              ← Go to job workspace to run matching
            </a>
          )}
        </div>
      )}

      {hasDocuments && (
        <div className="card-premium overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border/50 overflow-x-auto">
            {TAB_CONFIG.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                  activeTab === tabId
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Document content */}
          <div className="p-5">
            {currentDoc ? (
              <div className="space-y-4">
                {/* Actions bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CopyButton text={currentDoc.content} />
                    <button
                      onClick={() => {
                        if (["linkedin", "telegram", "whatsapp", "email"].includes(activeTab)) {
                          generateMsgMutation.mutate(activeTab as "linkedin" | "telegram" | "whatsapp" | "email");
                        } else {
                          generateMutation.mutate();
                        }
                      }}
                      disabled={generateMutation.isPending || generateMsgMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs text-muted-foreground transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Regenerate
                    </button>
                  </div>
                  <FactCheckPanel
                    doc={currentDoc}
                    jobId={id}
                    onRefresh={() => queryClient.invalidateQueries({ queryKey: ["job", id] })}
                  />
                </div>

                {/* Content */}
                {editingContent !== null ? (
                  <div className="bg-muted/20 rounded-xl p-5 min-h-48 space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={12}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingContent(null)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => setEditingContent(null)}
                        className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : activeTab === "resume" ? (
                  <div>
                    {renderDocContent(currentDoc)}
                  </div>
                ) : (
                  <div className="bg-muted/20 rounded-xl p-5 min-h-48">
                    {renderDocContent(currentDoc)}
                    <button
                      onClick={() => setEditingContent(currentDoc.content)}
                      className="mt-3 text-xs text-primary hover:underline block"
                    >
                      Edit content
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground">
                  Version {currentDoc.version} · Generated {new Date(currentDoc.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">
                  No {activeTab.replace("_", " ")} generated yet.
                </p>
                {["linkedin", "telegram", "whatsapp", "email"].includes(activeTab) && (
                  <button
                    onClick={() => generateMsgMutation.mutate(activeTab as "linkedin" | "telegram" | "whatsapp" | "email")}
                    disabled={generateMsgMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {generateMsgMutation.isPending ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating...</>
                    ) : (
                      <>Generate {activeTab} message</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
