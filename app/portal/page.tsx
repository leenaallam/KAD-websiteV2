"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { Step1Category } from "@/components/portal/steps/Step1Category";
import { Step2Type } from "@/components/portal/steps/Step2Type";
import { Step3Size } from "@/components/portal/steps/Step3Size";
import { Step7Budget } from "@/components/portal/steps/Step7Budget";
import { Step8Files } from "@/components/portal/steps/Step8Files";
import { Step9Contact } from "@/components/portal/steps/Step9Contact";
import { Step10Review } from "@/components/portal/steps/Step10Review";
import { Step11Submit } from "@/components/portal/steps/Step11Submit";

/**
 * Portal entry — stateful single-page experience.
 *
 * Why one page instead of `/portal/[step]` dynamic routes:
 *   - AnimatePresence between steps is dramatically smoother than route
 *     changes (no flash of unstyled state, no remount of the backdrop)
 *   - Step state and validation already live in Zustand and persist to
 *     sessionStorage, so refresh-recovery still works without URLs
 *   - The cinematic shell stays mounted across the whole journey, so the
 *     ambient backdrop never resets
 *
 * Each step is rendered by mapping `STEPS[stepIndex]` → component below.
 */
export default function PortalPage() {
  return (
    <PortalShell
      steps={{
        category: <Step1Category />,
        type: <Step2Type />,
        size: <Step3Size />,
        budget: <Step7Budget />,
        files: <Step8Files />,
        contact: <Step9Contact />,
        review: <Step10Review />,
        submit: <Step11Submit />,
      }}
    />
  );
}
