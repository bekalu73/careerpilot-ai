"use client";

import { use, useState, useRef, useEffect } from "react";
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
  Bot,
  HelpCircle,
  Sparkles,
  Trash2,
  CheckCircle2,
  Plus,
  CornerDownLeft,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons";
import { api, type GeneratedDocument, type ApplicationAnswer } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ResumeDocument } from "@/components/resume-document";

type DocTab =
  | "cover_letter"
  | "resume"
  | "questions"
  | "copilot"
  | "linkedin"
  | "telegram"
  | "whatsapp"
  | "email";

const TAB_CONFIG: {
  id: DocTab;
  label: string;
  icon: React.ElementType;
  docType?: string;
  badge?: string;
}[] = [
  { id: "cover_letter", label: "Cover Letter", icon: FileText, docType: "COVER_LETTER" },
  { id: "resume", label: "Resume", icon: FileText, docType: "RESUME" },
  { id: "questions", label: "Application Q&A", icon: HelpCircle, badge: "Smart" },
  { id: "copilot", label: "AI Copilot Chat", icon: Bot, badge: "AI" },
  { id: "linkedin", label: "LinkedIn", icon: LinkedinIcon, docType: "RECRUITER_MESSAGE_LINKEDIN" },
  { id: "telegram", label: "Telegram", icon: Send, docType: "RECRUITER_MESSAGE_TELEGRAM" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, docType: "RECRUITER_MESSAGE_WHATSAPP" },
  { id: "email", label: "Email", icon: MessageSquare, docType: "RECRUITER_MESSAGE_EMAIL" },
];

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs text-muted-foreground transition-colors shrink-0"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

function FactCheckPanel({
  doc,
  jobId,
  onRefresh,
}: {
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
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Fact-checking...
          </>
        ) : (
          <>
            <ShieldCheck className="h-3.5 w-3.5" />
            Run Fact Check
          </>
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
          <p
            className={cn(
              "font-semibold",
              claim.severity === "HIGH"
                ? "text-red-400"
                : claim.severity === "MEDIUM"
                ? "text-amber-400"
                : "text-muted-foreground"
            )}
          >
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

// ─── Application Form Q&A Generator Component ─────────────────────────────────

function JobApplicationQuestionsPanel({
  jobId,
  jobTitle,
  company,
}: {
  jobId: string;
  jobTitle?: string;
  company?: string;
}) {
  const queryClient = useQueryClient();
  const [questionInput, setQuestionInput] = useState("");
  const [instructionsInput, setInstructionsInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: answers = [], isLoading } = useQuery({
    queryKey: ["job-answers", jobId],
    queryFn: () => api.jobs.getAnswers(jobId),
  });

  const deleteMutation = useMutation({
    mutationFn: (answerId: string) => api.jobs.deleteAnswer(jobId, answerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["job-answers", jobId] }),
  });

  const handleAnswerQuestion = async (q: string, instructions?: string) => {
    if (!q.trim()) return;
    setIsGenerating(true);
    try {
      await api.jobs.answerQuestion(jobId, q.trim(), instructions);
      queryClient.invalidateQueries({ queryKey: ["job-answers", jobId] });
      setQuestionInput("");
      setInstructionsInput("");
    } catch (err) {
      console.error("Failed to answer question", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const presetQuestions = [
    `Why do you want to work at ${company || "this company"} as a ${jobTitle || "Engineer"}?`,
    `What makes you an ideal fit for the ${jobTitle || "role"} at ${company || "our team"}?`,
    `Describe your hands-on experience with RAG, Generative AI, or LLM-powered applications.`,
    `Tell us about a complex technical challenge you solved and how you measured success.`,
    `What are your compensation / salary expectations for this role?`,
  ];

  return (
    <div className="space-y-6">
      {/* Form Input */}
      <div className="bg-muted/20 border border-border rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Answer Any Job Application Question
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Paste questions from Google Forms, Greenhouse, Lever, Workday, or Ashby to generate tailored answers grounded in your verified career data.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Application Question *
            </label>
            <textarea
              rows={2}
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="e.g. Why are you interested in joining our AI team?"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Optional constraints / formatting instructions (e.g. "Keep under 150 words", "Emphasize Python and vector databases")
            </label>
            <input
              type="text"
              value={instructionsInput}
              onChange={(e) => setInstructionsInput(e.target.value)}
              placeholder="e.g. Concise, 150 words, highlight AI agent experience"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            onClick={() => handleAnswerQuestion(questionInput, instructionsInput)}
            disabled={isGenerating || !questionInput.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating Tailored Answer...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Generate Tailored Answer
              </>
            )}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground font-medium mb-2">
            Suggested application questions for {company || "this job"}:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presetQuestions.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuestionInput(preset)}
                className="text-[11px] text-left px-2.5 py-1 rounded-md bg-muted/60 hover:bg-primary/15 hover:text-primary border border-border text-muted-foreground transition-colors"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer List */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Generated Answers for this Application ({answers.length})
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card-premium p-4 animate-pulse h-28" />
            ))}
          </div>
        ) : answers.length === 0 ? (
          <div className="card-premium p-6 text-center space-y-2">
            <HelpCircle className="h-6 w-6 text-muted-foreground/40 mx-auto" />
            <p className="text-xs text-muted-foreground">
              No questions answered yet. Type or click a suggested question above to get instant answers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {answers.map((item) => (
              <div key={item.id} className="card-premium p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground flex-1">
                    {item.question}
                  </h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.answer && <CopyButton text={item.answer} />}
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      title="Delete answer"
                      className="h-8 w-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-3.5 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                  {item.answer || "No answer generated"}
                </div>

                {item.answer && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Grounded in Career Brain & Job Match
                    </span>
                    <span>
                      {item.answer.split(/\s+/).filter(Boolean).length} words ·{" "}
                      {item.answer.length} characters
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Copilot Chatbot Component ─────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

function JobCopilotChatPanel({
  jobId,
  jobTitle,
  company,
}: {
  jobId: string;
  jobTitle?: string;
  company?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hello! I'm your dedicated Job Copilot for **${jobTitle || "this position"}** at **${company || "the company"}**.\n\nI have full access to your verified Career Brain (skills, projects, experience) and this job's requirements. Ask me anything:\n- "How should I introduce myself for this interview?"\n- "Draft a compelling answer for why I want this role"\n- "What technical questions might they ask about my RAG & AI projects?"\n- "Help me explain the architecture of my best matching project"`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      role: "user",
      content: userText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = newHistory.slice(1, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.jobs.chat(jobId, userMsg.content, historyPayload);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const quickPrompts = [
    `Give me a 60-second elevator pitch for the hiring manager at ${company || "the company"}`,
    `How do my RAG and AI chatbot skills match this job?`,
    `What are potential technical interview questions for this role?`,
    `Write a punchy thank-you email after the interview`,
  ];

  return (
    <div className="flex flex-col h-[600px] bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              Job Copilot
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20">
                Online
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {jobTitle} · {company}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content: `Chat history cleared. How can I help you with your application to ${company || "this company"}?`,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ])
          }
          className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1 rounded hover:bg-muted transition-colors"
        >
          Reset Chat
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 max-w-[88%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {msg.role === "assistant" && (
              <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}

            <div className="space-y-1">
              <div
                className={cn(
                  "p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/40 text-foreground border border-border/80 rounded-tl-none font-sans"
                )}
              >
                {msg.content}
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 text-[10px] text-muted-foreground px-1",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.time && <span>{msg.time}</span>}
                {msg.role === "assistant" && i > 0 && (
                  <CopyButton text={msg.content} label="Copy text" />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[85%]">
            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              Thinking with your career brain...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-border/60 bg-muted/10 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary/15 hover:text-primary border border-border text-muted-foreground transition-colors disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or paste an application question... (Enter to send, Shift+Enter for newline)"
            className="flex-1 bg-input border border-border rounded-lg px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none max-h-24"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Application Package Page ───────────────────────────────────────────

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
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Package
              </>
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

      {/* Tab Navigation Header */}
      <div className="card-premium overflow-hidden">
        <div className="flex border-b border-border/50 overflow-x-auto">
          {TAB_CONFIG.map(({ id: tabId, label, icon: Icon, badge }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors relative",
                activeTab === tabId
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/15 text-primary border border-primary/20 font-bold ml-0.5">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === "copilot" ? (
            <JobCopilotChatPanel
              jobId={id}
              jobTitle={job?.title}
              company={job?.company}
            />
          ) : activeTab === "questions" ? (
            <JobApplicationQuestionsPanel
              jobId={id}
              jobTitle={job?.title}
              company={job?.company}
            />
          ) : currentDoc ? (
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
                <div>{renderDocContent(currentDoc)}</div>
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
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate {activeTab} message</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
