"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { api, type Skill } from "@/lib/api";
import { cn } from "@/lib/utils";

function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce((acc, skill) => {
    const cat = skill.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
}

const PROFICIENCY_COLOR: Record<string, string> = {
  BEGINNER: "text-muted-foreground",
  INTERMEDIATE: "text-amber-400",
  ADVANCED: "text-primary",
  EXPERT: "text-emerald-400",
};

const SUGGESTED_CATEGORIES = [
  "Programming Languages",
  "AI / Machine Learning / RAG",
  "Frameworks & Libraries",
  "Databases & Storage",
  "Cloud & DevOps",
  "Tools & Platforms",
  "Methodologies & Soft Skills",
];

function SkillFormModal({
  skill,
  defaultCategory,
  onSave,
  onCancel,
  isSaving,
}: {
  skill?: Partial<Skill> | null;
  defaultCategory?: string;
  onSave: (data: Partial<Skill>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Skill>>(
    skill ?? {
      name: "",
      category: defaultCategory || "Programming Languages",
      proficiency: "ADVANCED",
      yearsOfExp: 2,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-semibold text-foreground">
            {skill?.id ? "Edit Skill" : "Add New Skill"}
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
            <label className="text-xs text-muted-foreground mb-1 block">Skill Name *</label>
            <input
              type="text"
              required
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. LangChain, Retrieval-Augmented Generation, PyTorch, TypeScript"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category *</label>
            <input
              type="text"
              required
              value={form.category ?? ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. AI / Machine Learning / RAG"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary mb-2"
            />
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded-full border transition-colors",
                    form.category === cat
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Proficiency</label>
              <select
                value={form.proficiency ?? "ADVANCED"}
                onChange={(e) => setForm({ ...form, proficiency: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Years of Experience
              </label>
              <input
                type="number"
                min={0}
                max={40}
                step={0.5}
                value={form.yearsOfExp ?? ""}
                onChange={(e) =>
                  setForm({ ...form, yearsOfExp: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="e.g. 3"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
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
              disabled={isSaving || !form.name?.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {skill?.id ? "Update Skill" : "Add Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const queryClient = useQueryClient();
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null | undefined>(
    undefined
  );
  const [defaultCategory, setDefaultCategory] = useState<string | undefined>(undefined);

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: api.career.getSkills,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Skill>) => api.career.createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setEditingSkill(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Skill> }) =>
      api.career.updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setEditingSkill(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.career.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
    },
  });

  const handleSave = (data: Partial<Skill>) => {
    if (editingSkill?.id) {
      updateMutation.mutate({ id: editingSkill.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const openAddModal = (category?: string) => {
    setDefaultCategory(category);
    setEditingSkill({});
  };

  const grouped = groupByCategory(skills);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Skills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {skills.length} skills across {Object.keys(grouped).length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </button>
          <Link
            href="/career"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="card-premium p-8 text-center space-y-3">
          <Wrench className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">No skills added yet.</p>
          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, categorySkills]) => (
            <div key={category} className="card-premium p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category} ({categorySkills.length})
                </h2>
                <button
                  onClick={() => openAddModal(category)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <Plus className="h-3 w-3" />
                  Add to {category}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all",
                      skill.proficiency
                        ? "bg-primary/5 border-primary/20 hover:border-primary/40"
                        : "bg-muted/50 border-border/50 hover:border-border"
                    )}
                  >
                    <span className="text-foreground font-medium">{skill.name}</span>
                    {skill.proficiency && (
                      <span className={cn("text-[10px]", PROFICIENCY_COLOR[skill.proficiency])}>
                        {skill.proficiency.toLowerCase()}
                      </span>
                    )}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
                      <button
                        onClick={() => setEditingSkill(skill)}
                        title="Edit skill"
                        className="p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        title="Delete skill"
                        className="p-0.5 text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingSkill !== undefined && (
        <SkillFormModal
          skill={editingSkill}
          defaultCategory={defaultCategory}
          onSave={handleSave}
          onCancel={() => setEditingSkill(undefined)}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
