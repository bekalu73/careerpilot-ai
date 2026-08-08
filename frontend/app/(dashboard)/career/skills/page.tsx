"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Wrench } from "lucide-react";
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

export default function SkillsPage() {
  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: api.career.getSkills,
  });

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
        <Link href="/career" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
          ← Back to Profile
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <Wrench className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No skills yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, categorySkills]) => (
            <div key={category} className="card-premium p-5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h2>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs",
                      skill.proficiency
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/50 border-border/50"
                    )}
                  >
                    <span className="text-foreground font-medium">{skill.name}</span>
                    {skill.proficiency && (
                      <span className={cn("text-[10px]", PROFICIENCY_COLOR[skill.proficiency])}>
                        {skill.proficiency.toLowerCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
