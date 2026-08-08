"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import { api, type Education } from "@/lib/api";
import { formatDate } from "@/lib/utils";

function EducationFormModal({
  edu,
  onSave,
  onCancel,
  isSaving,
}: {
  edu?: Partial<Education> | null;
  onSave: (data: Partial<Education>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Education>>(
    edu ?? {
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.institution?.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-semibold text-foreground">
            {edu?.id ? "Edit Education" : "Add Education"}
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
            <label className="text-xs text-muted-foreground mb-1 block">
              Institution / University *
            </label>
            <input
              type="text"
              required
              value={form.institution ?? ""}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="e.g. Stanford University or Addis Ababa Science and Technology University"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Degree</label>
              <input
                type="text"
                value={form.degree ?? ""}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                placeholder="e.g. Bachelor of Science"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Field of Study</label>
              <input
                type="text"
                value={form.field ?? ""}
                onChange={(e) => setForm({ ...form, field: e.target.value })}
                placeholder="e.g. Computer Science and Engineering"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
              <input
                type="month"
                value={form.startDate ? form.startDate.substring(0, 7) : ""}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value ? e.target.value + "-01" : null })
                }
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
              <input
                type="month"
                value={form.endDate ? form.endDate.substring(0, 7) : ""}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value ? e.target.value + "-01" : null })
                }
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">GPA / Honors</label>
              <input
                type="text"
                value={form.gpa ?? ""}
                onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                placeholder="e.g. 3.8 / 4.0"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description / Honors</label>
            <textarea
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Relevant coursework, awards, honors, research..."
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
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
              disabled={isSaving || !form.institution?.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {edu?.id ? "Update Education" : "Add Education"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EducationPage() {
  const queryClient = useQueryClient();
  const [editingEdu, setEditingEdu] = useState<Partial<Education> | null | undefined>(
    undefined
  );

  const { data: educations = [], isLoading } = useQuery({
    queryKey: ["education"],
    queryFn: api.career.getEducation,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Education>) => api.career.createEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setEditingEdu(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Education> }) =>
      api.career.updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setEditingEdu(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.career.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
    },
  });

  const handleSave = (data: Partial<Education>) => {
    if (editingEdu?.id) {
      updateMutation.mutate({ id: editingEdu.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this education record?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Education</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {educations.length} education records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingEdu({})}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Education
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
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : educations.length === 0 ? (
        <div className="card-premium p-8 text-center space-y-3">
          <GraduationCap className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">No education records yet.</p>
          <button
            onClick={() => setEditingEdu({})}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Education
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="card-premium p-5 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                  </h3>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {edu.startDate ? formatDate(edu.startDate) : "N/A"} –{" "}
                    {edu.endDate ? formatDate(edu.endDate) : "Present"}
                    {edu.gpa && <span className="ml-2 font-medium">GPA: {edu.gpa}</span>}
                  </div>
                  {edu.description && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditingEdu(edu)}
                  title="Edit education"
                  className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(edu.id)}
                  title="Delete education"
                  className="h-7 w-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingEdu !== undefined && (
        <EducationFormModal
          edu={editingEdu}
          onSave={handleSave}
          onCancel={() => setEditingEdu(undefined)}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
