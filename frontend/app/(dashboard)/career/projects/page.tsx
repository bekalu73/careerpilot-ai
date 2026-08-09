"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { api, type Project } from "@/lib/api";
import { formatDate } from "@/lib/utils";

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-premium p-5 space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">
              {project.name}
            </h3>
            {project.role && (
              <p className="text-xs text-primary font-medium mt-0.5">{project.role}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Repository"
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <GithubIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Live Demo"
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            <button
              onClick={() => onEdit(project)}
              title="Edit project"
              className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors ml-1"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              title="Delete project"
              className="h-7 w-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </button>
          </div>
        </div>

        {project.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.domains && project.domains.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.domains.map((d) => (
              <span
                key={d}
                className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
              >
                {d}
              </span>
            ))}
          </div>
        )}

        {project.responsibilities && project.responsibilities.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {project.responsibilities.length} key achievements / bullets
            </button>
            {expanded && (
              <ul className="mt-2 space-y-1 pl-4 list-disc list-outside marker:text-primary">
                {project.responsibilities.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground pl-1">
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {(project.startDate || project.endDate || project.isCurrent) && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70 pt-2 border-t border-border/40">
          <Calendar className="h-3 w-3" />
          {project.startDate ? formatDate(project.startDate) : "N/A"} –{" "}
          {project.isCurrent ? "Present" : project.endDate ? formatDate(project.endDate) : "N/A"}
        </div>
      )}
    </div>
  );
}

function ProjectFormModal({
  project,
  onSave,
  onCancel,
  isSaving,
}: {
  project?: Partial<Project> | null;
  onSave: (data: Partial<Project>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<Partial<Project>>(
    project ?? {
      name: "",
      role: "",
      description: "",
      technologies: [],
      domains: [],
      responsibilities: [],
      githubUrl: "",
      demoUrl: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
    }
  );
  const [techInput, setTechInput] = useState(form.technologies?.join(", ") ?? "");
  const [domainInput, setDomainInput] = useState(form.domains?.join(", ") ?? "");
  const [respInput, setRespInput] = useState(form.responsibilities?.join("\n") ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) return;

    onSave({
      ...form,
      technologies: techInput.split(",").map((s) => s.trim()).filter(Boolean),
      domains: domainInput.split(",").map((s) => s.trim()).filter(Boolean),
      responsibilities: respInput.split("\n").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-semibold text-foreground">
            {project?.id ? "Edit Project" : "Add New Project"}
          </h2>
          <button
            onClick={onCancel}
            className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Project Name *</label>
              <input
                type="text"
                required
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. AI Resume & Career Platform"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Role / Title</label>
              <input
                type="text"
                value={form.role ?? ""}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Lead AI Engineer / Full-Stack Developer"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea
              rows={2}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief overview of what the project is and what problem it solves..."
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. Next.js, FastAPI, LangChain, PostgreSQL, RAG"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Domains / Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. Generative AI, Career Tech, SaaS"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">GitHub URL</label>
              <input
                type="url"
                value={form.githubUrl ?? ""}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                placeholder="https://github.com/username/project"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Live Demo / URL</label>
              <input
                type="url"
                value={form.demoUrl ?? ""}
                onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                placeholder="https://myproject.vercel.app"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <div className="space-y-1">
                <input
                  type="month"
                  value={form.endDate ? form.endDate.substring(0, 7) : ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endDate: e.target.value ? e.target.value + "-01" : null,
                      isCurrent: false,
                    })
                  }
                  disabled={form.isCurrent}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
                />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={form.isCurrent ?? false}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isCurrent: e.target.checked,
                        endDate: e.target.checked ? null : form.endDate,
                      })
                    }
                    className="rounded"
                  />
                  Ongoing / Current project
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Key Responsibilities / Bullet Points (one per line)
            </label>
            <textarea
              rows={3}
              value={respInput}
              onChange={(e) => setRespInput(e.target.value)}
              placeholder="Architected vector search RAG pipeline using Pinecone and Gemini&#10;Reduced latency by 45% through client-side query caching"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
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
              disabled={isSaving || !form.name?.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {project?.id ? "Update Project" : "Add Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [editingProject, setEditingProject] = useState<Partial<Project> | null | undefined>(
    undefined
  );

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: api.career.getProjects,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Project>) => api.career.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setEditingProject(undefined);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      api.career.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
      setEditingProject(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.career.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
    },
  });

  const handleSave = (data: Partial<Project>) => {
    if (editingProject?.id) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} projects in your Career Brain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingProject({})}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Project
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card-premium p-8 text-center space-y-3">
          <FolderOpen className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">
            No projects added yet. Add projects to boost your job match accuracy!
          </p>
          <button
            onClick={() => setEditingProject({})}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => setEditingProject(p)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editingProject !== undefined && (
        <ProjectFormModal
          project={editingProject}
          onSave={handleSave}
          onCancel={() => setEditingProject(undefined)}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
