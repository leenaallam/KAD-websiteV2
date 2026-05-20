"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* =============================================================================
 * Portal state — the entire onboarding form lives in one Zustand store so
 * cinematic transitions between steps don't unmount the underlying data.
 * Persisted to sessionStorage so a refresh mid-flow doesn't lose the user's
 * progress — but cleared on tab close (intake state isn't durable, the final
 * submission is).
 * ========================================================================= */

export type Category = "residential" | "commercial";

export type ResidentialType =
  | "apartment"
  | "villa"
  | "duplex"
  | "penthouse"
  | "chalet";

export type CommercialType =
  | "office"
  | "retail"
  | "restaurant"
  | "cafe"
  | "clinic"
  | "hotel"
  | "showroom";

export type ProjectType = ResidentialType | CommercialType;

export type SizeBand =
  | "lt-150"
  | "150-200"
  | "200-300"
  | "gt-300";

export type BudgetBand = "standard" | "premium" | "luxury" | "ultra-luxury";

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  /** Object URL for client-side preview; replaced with Storage path after upload. */
  previewUrl?: string;
};

export type ContactInfo = {
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
};

/* ------- step model ------- */
export const STEPS = [
  "category",
  "type",
  "size",
  "budget",
  "files",
  "contact",
  "review",
  "submit",
] as const;

export type StepId = (typeof STEPS)[number];

type PortalState = {
  /** Index into STEPS. Drives the step indicator and transition direction. */
  stepIndex: number;
  /** Last-known navigation direction for AnimatePresence variants. */
  direction: 1 | -1;

  /* form values */
  category: Category | null;
  projectType: ProjectType | null;
  size: SizeBand | null;
  budget: BudgetBand | null;
  files: UploadedFile[];
  contact: ContactInfo;

  /* submission lifecycle */
  isSubmitting: boolean;
  submitted: boolean;

  /* actions */
  setCategory: (c: Category) => void;
  setProjectType: (t: ProjectType) => void;
  setSize: (s: SizeBand) => void;
  setBudget: (b: BudgetBand) => void;
  addFiles: (f: UploadedFile[]) => void;
  removeFile: (id: string) => void;
  setContact: <K extends keyof ContactInfo>(k: K, v: ContactInfo[K]) => void;
  next: () => void;
  back: () => void;
  jumpTo: (i: number) => void;
  markSubmitting: (v: boolean) => void;
  markSubmitted: () => void;
  reset: () => void;
};

const initialContact: ContactInfo = {
  fullName: "",
  phone: "",
  whatsapp: "",
  email: "",
};

export const usePortalStore = create<PortalState>()(
  persist(
    (set, get) => ({
      stepIndex: 0,
      direction: 1,
      category: null,
      projectType: null,
      size: null,
      budget: null,
      files: [],
      contact: initialContact,
      isSubmitting: false,
      submitted: false,

      setCategory: (c) =>
        set((s) => ({
          category: c,
          // changing category invalidates the project type beneath it
          projectType: s.category === c ? s.projectType : null,
        })),
      setProjectType: (t) => set({ projectType: t }),
      setSize: (s) => set({ size: s }),
      setBudget: (b) => set({ budget: b }),
      addFiles: (f) => set((s) => ({ files: [...s.files, ...f] })),
      removeFile: (id) =>
        set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
      setContact: (k, v) =>
        set((s) => ({ contact: { ...s.contact, [k]: v } })),
      next: () =>
        set((s) => ({
          stepIndex: Math.min(STEPS.length - 1, s.stepIndex + 1),
          direction: 1,
        })),
      back: () =>
        set((s) => ({
          stepIndex: Math.max(0, s.stepIndex - 1),
          direction: -1,
        })),
      jumpTo: (i) =>
        set((s) => ({
          stepIndex: Math.max(0, Math.min(STEPS.length - 1, i)),
          direction: i >= s.stepIndex ? 1 : -1,
        })),
      markSubmitting: (v) => set({ isSubmitting: v }),
      markSubmitted: () => set({ submitted: true, isSubmitting: false }),
      reset: () =>
        set({
          stepIndex: 0,
          direction: 1,
          category: null,
          projectType: null,
          size: null,
          budget: null,
          files: [],
          contact: initialContact,
          isSubmitting: false,
          submitted: false,
        }),
    }),
    {
      name: "kad-portal",
      storage: createJSONStorage(() => {
        // SSR no-op storage so the store import is safe in server components.
        // createJSONStorage only calls getItem/setItem/removeItem on its
        // returned object, so the minimal shape satisfies it at runtime —
        // the type cast routes through `unknown` to satisfy TS's stricter
        // structural check for the Storage interface.
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as unknown as Storage;
        }
        return sessionStorage;
      }),
      // don't persist transient lifecycle flags
      partialize: (s) => ({
        stepIndex: s.stepIndex,
        category: s.category,
        projectType: s.projectType,
        size: s.size,
        budget: s.budget,
        contact: s.contact,
        // `files` deliberately excluded — File objects don't serialize and
        // we don't keep upload state across reloads.
      }),
    }
  )
);

/** Validation per step — disables the Next CTA until the step is satisfied. */
export function isStepValid(state: PortalState, step: StepId): boolean {
  switch (step) {
    case "category":
      return state.category !== null;
    case "type":
      return state.projectType !== null;
    case "size":
      return state.size !== null;
    case "budget":
      return state.budget !== null;
    case "files":
      return true; // optional
    case "contact":
      return (
        state.contact.fullName.trim().length > 1 &&
        /^\S+@\S+\.\S+$/.test(state.contact.email) &&
        state.contact.phone.trim().length > 4
      );
    case "review":
      return true;
    case "submit":
      return true;
  }
}
