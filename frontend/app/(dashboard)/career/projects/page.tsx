"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FolderOpen,
  Plus,
  Globe,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { useState } from "react";
import { api, type Project } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-premium p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
          {project.role && (
            <p className="text-xs text-muted-foreground mt-0.5">{project.role}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <GithubIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
              className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          )}
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{project.description}</p>
      )}

      {project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span key={tech} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {tech}
            </span>
          ))}
        </div>
      )}

      {project.domains.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.domains.map((d) => (
            <span key={d} className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              {d}
            </span>
          ))}
        </div>
      )}

      {project.responsibilities.length > 0 && (
        <div>
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {project.responsibilities.length} bullet points
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1 pl-3">
              {project.responsibilities.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">·</span>{r}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(project.startDate || project.endDate) && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {project.startDate ? formatDate(project.startDate) : "?"} –{" "}
          {project.isCurrent ? "Present" : project.endDate ? formatDate(project.endDate) : "?"}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: api.career.getProjects,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} projects in your Career Brain
          </p>
        </div>
        <Link href="/career" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
          ← Back to Profile
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No projects yet. Import your resume to populate them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
