"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  Calendar,
  MapPin,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api, type Experience } from "@/lib/api";
import { formatDate } from "@/lib/utils";

function ExperienceCard({ exp, onEdit, onDelete }: {
  exp: Experience;
  onEdit: (exp: Experience) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-premium p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Briefcase className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{exp.jobTitle}</h3>
              <p className="text-sm text-muted-foreground">{exp.company}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onEdit(exp)}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => onDelete(exp.id)}
                className="h-7 w-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(exp.startDate)} – {exp.isCurrent ? "Present" : exp.endDate ? formatDate(exp.endDate) : "N/A"}
            </span>
            {exp.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {exp.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Technologies */}
      {exp.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {exp.technologies.slice(0, 6).map((tech) => (
            <span
              key={tech}
              className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              {tech}
            </span>
          ))}
          {exp.technologies.length > 6 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              +{exp.technologies.length - 6}
            </span>
          )}
        </div>
      )}

      {/* Responsibilities (collapsible) */}
      {exp.responsibilities.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {exp.responsibilities.length} responsibilities
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1 pl-4 list-disc list-outside marker:text-primary">
              {exp.responsibilities.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground pl-1">
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ExperienceForm({ exp, onSave, onCancel }: {
  exp?: Partial<Experience>;
  onSave: (data: Partial<Experience>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Experience>>(exp ?? {
    company: "",
    jobTitle: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
    responsibilities: [],
    achievements: [],
    technologies: [],
    domains: [],
  });
  const [techInput, setTechInput] = useState(form.technologies?.join(", ") ?? "");
  const [respInput, setRespInput] = useState(form.responsibilities?.join("\n") ?? "");

  const handleSave = () => {
    onSave({
      ...form,
      technologies: techInput.split(",").map((s) => s.trim()).filter(Boolean),
      responsibilities: respInput.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="card-premium p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        {exp?.id ? "Edit Experience" : "Add Experience"}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Job Title *</label>
          <input
            type="text"
            value={form.jobTitle ?? ""}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            placeholder="e.g. Mobile App Developer"
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Company *</label>
          <input
            type="text"
            value={form.company ?? ""}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="e.g. EagleLion System Technology"
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Start Date *</label>
          <input
            type="month"
            value={form.startDate ? form.startDate.substring(0, 7) : ""}
            onChange={(e) => setForm({ ...form, startDate: e.target.value + "-01" })}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
          <div className="space-y-1">
            <input
              type="month"
              value={form.endDate ? form.endDate.substring(0, 7) : ""}
              onChange={(e) => setForm({ ...form, endDate: e.target.value + "-01", isCurrent: false })}
              disabled={form.isCurrent}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
            />
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={form.isCurrent ?? false}
                onChange={(e) => setForm({ ...form, isCurrent: e.target.checked, endDate: e.target.checked ? undefined : form.endDate })}
                className="rounded"
              />
              Currently working here
            </label>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Location</label>
          <input
            type="text"
            value={form.location ?? ""}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Addis Ababa, Ethiopia"
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Technologies (comma-separated)</label>
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="React Native, TypeScript, Zustand"
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Responsibilities (one per line)</label>
        <textarea
          value={respInput}
          onChange={(e) => setRespInput(e.target.value)}
          rows={4}
          placeholder="Developed secure mobile banking features using React Native..."
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Save Experience
        </button>
      </div>
    </div>
  );
}

export default function ExperiencePage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ["experiences"],
    queryFn: api.career.getExperiences,
  });

  const createMutation = useMutation({
    mutationFn: api.career.createExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Experience> }) =>
      api.career.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      setEditingExp(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.career.deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Work Experience</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {experiences.length} work experiences in your Career Brain
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingExp(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Experience
        </button>
      </div>

      {showForm && !editingExp && (
        <ExperienceForm
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-48 mb-2" />
              <div className="h-4 bg-muted rounded w-36" />
            </div>
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No work experience added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) =>
            editingExp?.id === exp.id ? (
              <ExperienceForm
                key={exp.id}
                exp={exp}
                onSave={(data) => updateMutation.mutate({ id: exp.id, data })}
                onCancel={() => setEditingExp(null)}
              />
            ) : (
              <ExperienceCard
                key={exp.id}
                exp={exp}
                onEdit={setEditingExp}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
