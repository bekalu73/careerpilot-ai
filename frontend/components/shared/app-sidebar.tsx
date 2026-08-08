"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Settings,
  Brain,
  ChevronRight,
  Rocket,
  GraduationCap,
  FolderOpen,
  Wrench,
  Trophy,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const navSections = [
  {
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Career Brain",
    items: [
      { href: "/career", label: "Profile", icon: User },
      { href: "/career/experience", label: "Experience", icon: Briefcase },
      { href: "/career/projects", label: "Projects", icon: FolderOpen },
      { href: "/career/skills", label: "Skills", icon: Wrench },
      { href: "/career/education", label: "Education", icon: GraduationCap },
    ],
  },
  {
    label: "Jobs",
    items: [
      { href: "/jobs", label: "All Jobs", icon: Brain },
      { href: "/jobs/new", label: "Analyze New Job", icon: PlusCircle, highlight: true },
    ],
  },
  {
    label: "Applications",
    items: [
      { href: "/applications", label: "Applications", icon: FileText },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const { data: candidate } = useQuery({
    queryKey: ["candidate"],
    queryFn: api.career.getProfile,
    retry: false,
  });

  return (
    <aside className="flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
          <Rocket className="h-4 w-4 text-primary" />
        </div>
        <div>
          <span className="text-sm font-bold text-sidebar-foreground tracking-tight">
            CareerPilot
          </span>
          <span className="block text-[10px] text-sidebar-foreground/40 uppercase tracking-wider">
            AI
          </span>
        </div>
      </div>

      {/* Candidate info */}
      {candidate && (
        <div className="px-4 py-3 border-b border-sidebar-border/50">
          <p className="text-xs font-medium text-sidebar-foreground/90 truncate">
            {candidate.name}
          </p>
          <p className="text-[11px] text-sidebar-foreground/40 truncate">
            {candidate.email ?? "No email set"}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "sidebar-item group",
                      isActive && "active",
                      item.highlight &&
                        !isActive &&
                        "text-primary/80 hover:text-primary"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive
                          ? "text-sidebar-primary"
                          : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70",
                        item.highlight && !isActive && "text-primary/60"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="h-3 w-3 text-sidebar-primary/60" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-3 border-t border-sidebar-border/50 pt-2">
        <Link
          href="/settings"
          className={cn(
            "sidebar-item group",
            pathname === "/settings" && "active"
          )}
        >
          <Settings className="h-4 w-4 shrink-0 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
