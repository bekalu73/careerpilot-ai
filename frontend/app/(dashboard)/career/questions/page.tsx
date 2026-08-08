"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Copy,
  Check,
  X,
  Loader2,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { api, type ProfileAnswer } from "@/lib/api";
import { cn } from "@/lib/utils";

const DEFAULT_STANDARD_QUESTIONS = [
  {
    category: "General",
    question: "Tell me about yourself / Professional elevator pitch",
    suggestedPrompt: "Create a 90-second professional elevator pitch summarizing my background as a Software Engineer & AI Builder, core technical achievements, and passion for building high-impact products.",
  },
  {
    category: "Technical",
    question: "What is your experience with AI, RAG systems, and Generative AI?",
    suggestedPrompt: "Summarize my hands-on production experience designing and building Retrieval-Augmented Generation (RAG) pipelines, LLM-powered applications, AI chatbots, and vector search systems.",
  },
  {
    category: "Technical",
    question: "Describe a challenging project you built from scratch and the impact it had",
    suggestedPrompt: "Highlight a flagship project from my portfolio or experience, explaining the problem, the architecture, technologies used, and the measurable outcome.",
  },
  {
    category: "General",
    question: "Why are you looking for a new role / What drives your career?",
    suggestedPrompt: "Explain my motivation to work on challenging engineering problems, scale innovative AI and full-stack products, and collaborate with high-caliber teams.",
  },
  {
    category: "Logistics",
    question: "What is your work authorization status / visa requirement?",
    suggestedPrompt: "State work authorization status and eligibility to work.",
  },
  {
    category: "Logistics",
    question: "What is your notice period / When can you start?",
    suggestedPrompt: "State current availability and transition timeline for starting a new position.",
  },
  {
    category: "Logistics",
    question: "What is your preferred work arrangement (Remote / Hybrid / Onsite)?",
    suggestedPrompt: "State preference for remote, hybrid, or onsite work opportunities.",
  },
  {
    category: "Logistics",
    question: "What are your salary / compensation expectations?",
    suggestedPrompt: "Provide a flexible and competitive compensation expectation based on role seniority, scope, and total rewards package.",
  },
];

const CATEGORIES = ["All", "General", "Technical", "Logistics"];

function CopyBtn({ text }: { text: string }) {
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
          Copy Answer
        </>
      )}
    </button>
  );
}

function QuestionModal({
  item,
  onSave,
  onCancel,
  isSaving,
}: {
  item?: Partial<ProfileAnswer> | null;
  onSave: (data: Partial<ProfileAnswer>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<ProfileAnswer>>(
    item ?? {
      category: "General",
      question: "",
      answer: "",
    }
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!form.question?.trim()) return;
    setIsGenerating(true);
    try {
      const res = await api.career.generateQuestionAnswer(
        form.question,
        form.category
      );
      setForm((prev) => ({ ...prev, answer: res.answer }));
    } catch (err) {
      console.error("Failed to generate answer", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question?.trim() || !form.answer?.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-semibold text-foreground">
            {item?.id ? "Edit Application Q&A" : "Add Application Question"}
          </h2>
          <button
            onClick={onCancel}
            className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
            <select
              value={form.category ?? "General"}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="General">General & Background</option>
              <option value="Technical">Technical & Projects</option>
              <option value="Logistics">Logistics & Work Authorization</option>
              <option value="Behavioral">Behavioral & Situational</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Question / Prompt *</label>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !form.question?.trim()}
                className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-40 font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" /> Auto-generate with Career Brain
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              required
              value={form.question ?? ""}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="e.g. Why should we hire you for this role?"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Answer *</label>
            <textarea
              rows={6}
              required
              value={form.answer ?? ""}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Write or auto-generate your verified answer..."
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
            />
            {form.answer && (
              <p className="text-[11px] text-muted-foreground mt-1 text-right">
                {form.answer.split(/\s+/).filter(Boolean).length} words ·{" "}
                {form.answer.length} characters
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !form.question?.trim() || !form.answer?.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {item?.id ? "Update Q&A" : "Save to Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CareerQuestionsPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingItem, setEditingItem] = useState<Partial<ProfileAnswer> | null | undefined>(
    undefined
  );
  const [generatingForIndex, setGeneratingForIndex] = useState<number | null>(null);

  const { data: savedAnswers = [], isLoading } = useQuery({
    queryKey: ["profile-questions"],
    queryFn: api.career.getQuestions,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ProfileAnswer>) => api.career.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-questions"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setEditingItem(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProfileAnswer> }) =>
      api.career.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-questions"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setEditingItem(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.career.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-questions"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
    },
  });

  const handleSave = (data: Partial<ProfileAnswer>) => {
    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleQuickGeneratePreset = async (preset: typeof DEFAULT_STANDARD_QUESTIONS[0], idx: number) => {
    setGeneratingForIndex(idx);
    try {
      const res = await api.career.generateQuestionAnswer(
        preset.question,
        preset.category
      );
      await api.career.createQuestion({
        category: preset.category,
        question: preset.question,
        answer: res.answer,
        isCustom: false,
      });
      queryClient.invalidateQueries({ queryKey: ["profile-questions"] });
    } catch (err) {
      console.error("Failed to generate preset answer", err);
    } finally {
      setGeneratingForIndex(null);
    }
  };

  // Filter saved answers
  const filteredSaved = savedAnswers.filter((item) => {
    if (selectedCategory === "All") return true;
    return item.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Filter missing presets that haven't been saved yet
  const savedQuestionTexts = new Set(savedAnswers.map((a) => a.question.toLowerCase().trim()));
  const missingPresets = DEFAULT_STANDARD_QUESTIONS.filter(
    (preset) => !savedQuestionTexts.has(preset.question.toLowerCase().trim())
  ).filter((preset) => {
    if (selectedCategory === "All") return true;
    return preset.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Job Application Q&A Bank
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-answered standard questions asked on Google, Greenhouse, Lever, Workday, and LinkedIn forms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingItem({})}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Custom Question
          </button>
          <Link
            href="/career"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors shrink-0"
          >
            ← Profile
          </Link>
        </div>
      </div>

      {/* Categories filter */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0 ml-1 mr-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Saved Answers */}
          {filteredSaved.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Saved Application Answers ({filteredSaved.length})
              </h2>
              <div className="space-y-3">
                {filteredSaved.map((item) => (
                  <div key={item.id} className="card-premium p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {item.category || "General"}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {item.question}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <CopyBtn text={item.answer} />
                        <button
                          onClick={() => setEditingItem(item)}
                          title="Edit"
                          className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this saved answer?")) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                          title="Delete"
                          className="h-8 w-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3.5 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans">
                      {item.answer}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Grounded in Career Brain
                      </span>
                      <span>
                        {item.answer.split(/\s+/).filter(Boolean).length} words ·{" "}
                        {item.answer.length} characters
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Preset Suggestions */}
          {missingPresets.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Standard Job Portal Questions ({missingPresets.length} ready to generate)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {missingPresets.map((preset, idx) => (
                  <div
                    key={preset.question}
                    className="card-premium p-4 flex flex-col justify-between space-y-3 hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {preset.category}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground mt-2">
                        {preset.question}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {preset.suggestedPrompt}
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickGeneratePreset(preset, idx)}
                      disabled={generatingForIndex !== null}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 transition-colors disabled:opacity-50"
                    >
                      {generatingForIndex === idx ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Generating with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          Generate Answer
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {editingItem !== undefined && (
        <QuestionModal
          item={editingItem}
          onSave={handleSave}
          onCancel={() => setEditingItem(undefined)}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
