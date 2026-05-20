"use client";

import { motion } from "framer-motion";
import { ChoiceCard } from "../ChoiceCard";
import { StepNav } from "../StepNav";
import {
  usePortalStore,
  type CommercialType,
  type ProjectType,
  type ResidentialType,
} from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";

type Option = {
  key: ProjectType;
  label: string;
  caption: string;
  Icon: () => React.ReactNode;
};

const RESIDENTIAL: Option[] = [
  {
    key: "apartment",
    label: "Apartment",
    caption: "A floor in a building — every room shares one shell.",
    Icon: IconApartment,
  },
  {
    key: "villa",
    label: "Villa",
    caption: "A standalone home with its own ground and garden.",
    Icon: IconVilla,
  },
  {
    key: "duplex",
    label: "Duplex",
    caption: "Two stories held in one continuous space.",
    Icon: IconDuplex,
  },
  {
    key: "penthouse",
    label: "Penthouse",
    caption: "The top of a tower, often with terrace and sky.",
    Icon: IconPenthouse,
  },
  {
    key: "chalet",
    label: "Chalet",
    caption: "A coastal or mountain retreat — looser, more weather-shaped.",
    Icon: IconChalet,
  },
];

const COMMERCIAL: Option[] = [
  {
    key: "office",
    label: "Office",
    caption: "A workspace staged for focus and clients.",
    Icon: IconOffice,
  },
  {
    key: "retail",
    label: "Retail Store",
    caption: "A shop where the brand is the architecture.",
    Icon: IconRetail,
  },
  {
    key: "restaurant",
    label: "Restaurant",
    caption: "A dining room — long evenings, layered light.",
    Icon: IconRestaurant,
  },
  {
    key: "cafe",
    label: "Café",
    caption: "Quick, warm, made for return visits.",
    Icon: IconCafe,
  },
  {
    key: "clinic",
    label: "Clinic",
    caption: "Calm, precise, with discreet wayfinding.",
    Icon: IconClinic,
  },
  {
    key: "hotel",
    label: "Hotel",
    caption: "Guest journey from arrival to morning light.",
    Icon: IconHotel,
  },
  {
    key: "showroom",
    label: "Showroom",
    caption: "A staged room for product, art, or auto.",
    Icon: IconShowroom,
  },
];

export function Step2Type() {
  const category = usePortalStore((s) => s.category);
  const projectType = usePortalStore((s) => s.projectType);
  const setProjectType = usePortalStore((s) => s.setProjectType);
  const next = usePortalStore((s) => s.next);

  const options =
    category === "commercial"
      ? COMMERCIAL
      : (RESIDENTIAL as readonly Option[]);
  const isResidential = category === "residential";

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.luxe, delay: 0.1 }}
      >
        <p className="eyebrow gold-glow-text">
          Step 02 — {isResidential ? "Residential" : "Commercial"} typology
        </p>
        <h1 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
          And{" "}
          <span className="italic text-[var(--gold-soft)] gold-glow-text">
            what type
          </span>{" "}
          of {isResidential ? "home" : "space"}?
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8"
      >
        {options.map((o, i) => (
          <motion.div
            key={o.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              ease: ease.luxe,
              delay: 0.35 + i * 0.06,
            }}
          >
            <ChoiceCard
              selected={projectType === o.key}
              onSelect={() => {
                setProjectType(o.key as ResidentialType | CommercialType);
                // Auto-advance — single-select decisions don't need a
                // confirmation tap. The 520ms grace gives the selection
                // bloom time to register before the step transitions.
                setTimeout(() => next(), 520);
              }}
              label={o.label}
              caption={o.caption}
              visual={<o.Icon />}
              aspect="portrait"
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-16">
        <StepNav />
      </div>
    </div>
  );
}

/* ============================================================================
 * Minimalist line-icons — single 0.8-weight stroke, ~32×32, gold tint applied
 * via currentColor at the ChoiceCard level. Kept abstract rather than literal
 * so they read as editorial illustration, not pictograms.
 * ========================================================================== */

const S = ({ children }: { children: React.ReactNode }) => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
    {children}
  </svg>
);

function IconApartment() {
  return (
    <S>
      <path d="M6 32V8h24v24H6Z" stroke="currentColor" strokeWidth="0.8" />
      <path
        d="M11 14h4M11 20h4M11 26h4M21 14h4M21 20h4M21 26h4"
        stroke="currentColor"
        strokeWidth="0.8"
      />
    </S>
  );
}
function IconVilla() {
  return (
    <S>
      <path d="M4 32V18L18 6l14 12v14H4Z" stroke="currentColor" strokeWidth="0.8" />
      <path d="M14 32V22h8v10" stroke="currentColor" strokeWidth="0.8" />
    </S>
  );
}
function IconDuplex() {
  return (
    <S>
      <path d="M6 32V8h24v24H6Z" stroke="currentColor" strokeWidth="0.8" />
      <path d="M6 20h24" stroke="currentColor" strokeWidth="0.8" />
      <path
        d="M13 14h4M19 14h4M13 26h4M19 26h4"
        stroke="currentColor"
        strokeWidth="0.8"
      />
    </S>
  );
}
function IconPenthouse() {
  return (
    <S>
      <path d="M3 32h30M6 32V12l12-4 12 4v20" stroke="currentColor" strokeWidth="0.8" />
      <path d="M14 32V22h8v10" stroke="currentColor" strokeWidth="0.8" />
      <path d="M6 16h24" stroke="currentColor" strokeWidth="0.6" />
    </S>
  );
}
function IconChalet() {
  return (
    <S>
      <path d="M4 32 18 6l14 26H4Z" stroke="currentColor" strokeWidth="0.8" />
      <path d="M14 32V24h8v8" stroke="currentColor" strokeWidth="0.8" />
    </S>
  );
}
function IconOffice() {
  return (
    <S>
      <path d="M6 32V6h22v26" stroke="currentColor" strokeWidth="0.8" />
      <path
        d="M11 12h4M11 18h4M11 24h4M19 12h4M19 18h4M19 24h4"
        stroke="currentColor"
        strokeWidth="0.6"
      />
      <path d="M4 32h28" stroke="currentColor" strokeWidth="0.8" />
    </S>
  );
}
function IconRetail() {
  return (
    <S>
      <path d="M4 32V14l4-6h20l4 6v18H4Z" stroke="currentColor" strokeWidth="0.8" />
      <path d="M4 14h28" stroke="currentColor" strokeWidth="0.6" />
      <path d="M14 32V22h8v10" stroke="currentColor" strokeWidth="0.8" />
    </S>
  );
}
function IconRestaurant() {
  return (
    <S>
      <path d="M11 4v12c0 1.5 2 2 2 4v12" stroke="currentColor" strokeWidth="0.8" />
      <path d="M15 4v12M19 4v12" stroke="currentColor" strokeWidth="0.8" />
      <path
        d="M25 4c-2 0-3 4-3 8 0 3 3 3 3 3v17"
        stroke="currentColor"
        strokeWidth="0.8"
      />
    </S>
  );
}
function IconCafe() {
  return (
    <S>
      <path
        d="M6 14h20v8c0 5-4 8-9 8h-2c-5 0-9-3-9-8v-8Z"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <path
        d="M26 16c3 0 4 2 4 4s-1 4-4 4"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <path d="M10 8c0-2 2-2 2-4M16 8c0-2 2-2 2-4M22 8c0-2 2-2 2-4" stroke="currentColor" strokeWidth="0.7" />
    </S>
  );
}
function IconClinic() {
  return (
    <S>
      <path d="M6 32V8h24v24H6Z" stroke="currentColor" strokeWidth="0.8" />
      <path d="M18 14v12M12 20h12" stroke="currentColor" strokeWidth="0.9" />
    </S>
  );
}
function IconHotel() {
  return (
    <S>
      <path d="M4 32V10h28v22" stroke="currentColor" strokeWidth="0.8" />
      <path
        d="M8 16h4v4H8zM16 16h4v4h-4zM24 16h4v4h-4zM8 24h4v4H8zM16 24h4v4h-4zM24 24h4v4h-4z"
        stroke="currentColor"
        strokeWidth="0.6"
      />
    </S>
  );
}
function IconShowroom() {
  return (
    <S>
      <path d="M3 18h30v14H3z" stroke="currentColor" strokeWidth="0.8" />
      <path d="M8 18V8h20v10" stroke="currentColor" strokeWidth="0.8" />
      <path d="M14 32V24h8v8" stroke="currentColor" strokeWidth="0.8" />
    </S>
  );
}
