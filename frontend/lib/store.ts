// Zustand global store for CareerPilot UI state

import { create } from "zustand";
import type { Candidate, Job } from "./api";

interface AppState {
  // Career profile
  candidate: Candidate | null;
  setCandidate: (candidate: Candidate | null) => void;

  // Active job workspace
  activeJobId: string | null;
  setActiveJobId: (id: string | null) => void;

  // Resume import flow
  importedResume: {
    parsed: Candidate | null;
    isReviewing: boolean;
  };
  setImportedResume: (data: { parsed: Candidate | null; isReviewing: boolean }) => void;
  clearImport: () => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Generation state per job
  generatingJobs: Set<string>;
  setGenerating: (jobId: string, isGenerating: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  candidate: null,
  setCandidate: (candidate) => set({ candidate }),

  activeJobId: null,
  setActiveJobId: (id) => set({ activeJobId: id }),

  importedResume: { parsed: null, isReviewing: false },
  setImportedResume: (data) => set({ importedResume: data }),
  clearImport: () =>
    set({ importedResume: { parsed: null, isReviewing: false } }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  generatingJobs: new Set(),
  setGenerating: (jobId, isGenerating) =>
    set((state) => {
      const next = new Set(state.generatingJobs);
      if (isGenerating) next.add(jobId);
      else next.delete(jobId);
      return { generatingJobs: next };
    }),
}));
