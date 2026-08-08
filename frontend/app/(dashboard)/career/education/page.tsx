"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { GraduationCap, Calendar } from "lucide-react";
import { api, type Education } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function EducationPage() {
  const { data: educations = [], isLoading } = useQuery({
    queryKey: ["education"],
    queryFn: api.career.getEducation,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Education</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {educations.length} education records
          </p>
        </div>
        <Link href="/career" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
          ← Back to Profile
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="card-premium p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : educations.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <GraduationCap className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No education records yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {educations.map((edu) => (
            <div key={edu.id} className="card-premium p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                </h3>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {edu.startDate ? formatDate(edu.startDate) : "?"} –{" "}
                  {edu.endDate ? formatDate(edu.endDate) : "Present"}
                  {edu.gpa && <span className="ml-2">GPA: {edu.gpa}</span>}
                </div>
                {edu.description && (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {edu.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
