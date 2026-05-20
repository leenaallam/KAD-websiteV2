"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { StepNav } from "../StepNav";
import { usePortalStore, type UploadedFile } from "@/lib/stores/portalStore";
import { ease } from "@/lib/animations/easings";
import { cn } from "@/lib/utils/cn";

const ACCEPT =
  "image/*,application/pdf,.dwg,.dxf,application/acad,application/x-dwg";

/**
 * Drag-and-drop reference upload.
 *
 * The drop zone is the centerpiece — large, breathing gold hairline, with
 * an AI-scan sweep that travels vertically across the zone every ~5 seconds
 * to signal liveness. When a file is dropped:
 *   1) An UploadedFile entry lands in the store
 *   2) A scan sweep runs across the new card once (the "AI reading" gesture)
 *   3) The card settles into a clean "Indexed" state
 *
 * Files are held in memory as object URLs for client-side preview. Actual
 * upload to Supabase Storage happens at submit-time inside /api/leads — we
 * don't ship bytes mid-flow because the user can still change their mind.
 */
export function Step8Files() {
  const files = usePortalStore((s) => s.files);
  const addFiles = usePortalStore((s) => s.addFiles);
  const removeFile = usePortalStore((s) => s.removeFile);

  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  const onDrop = useCallback(
    (incoming: FileList | File[] | null) => {
      if (!incoming || incoming.length === 0) return;
      const parsed: UploadedFile[] = Array.from(incoming).map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: f.type || guessTypeFromName(f.name),
        previewUrl: f.type.startsWith("image/")
          ? URL.createObjectURL(f)
          : undefined,
      }));
      addFiles(parsed);
    },
    [addFiles]
  );

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragging(false);
    }
  };
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  const handleDropEvent = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    onDrop(e.dataTransfer.files);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.luxe, delay: 0.1 }}
      >
        <p className="eyebrow gold-glow-text">Step 05 — References</p>
        <h1 className="mt-6 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2.4rem,6vw,5.4rem)] leading-[1] tracking-[-0.02em] text-[var(--bone)]">
          Drop anything that{" "}
          <span className="italic text-[var(--gold-soft)] gold-glow-text">
            speaks
          </span>{" "}
          to you.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--mist)]">
          Plans, photographs, moodboards, sketches, scribbles on a napkin —
          the studio reads all of it. Optional, but useful.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.luxe, delay: 0.3 }}
        className="mt-14"
      >
        <DropZone
          dragging={dragging}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDropEvent}
          onPick={(e) => onDrop(e.target.files)}
        />
      </motion.div>

      {/* File cards */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8"
          >
            <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-[var(--gold-soft)]">
              {files.length} {files.length === 1 ? "reference" : "references"}{" "}
              indexed
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence initial={false}>
                {files.map((f) => (
                  <FileCard
                    key={f.id}
                    file={f}
                    onRemove={() => removeFile(f.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-16">
        <StepNav nextLabel={files.length === 0 ? "Skip references" : undefined} />
      </div>
    </div>
  );
}

/* ============================================================================
 * Drop zone — the centerpiece
 * ========================================================================== */

function DropZone({
  dragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onPick,
}: {
  dragging: boolean;
  onDragEnter: (e: DragEvent<HTMLLabelElement>) => void;
  onDragLeave: (e: DragEvent<HTMLLabelElement>) => void;
  onDragOver: (e: DragEvent<HTMLLabelElement>) => void;
  onDrop: (e: DragEvent<HTMLLabelElement>) => void;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputId = useId();
  return (
    <label
      htmlFor={inputId}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-cursor="link"
      className={cn(
        "group relative isolate flex aspect-[5/2] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center transition-all duration-500",
        dragging
          ? "scale-[1.015] border-[var(--gold-soft)] bg-[rgba(201,163,59,0.06)] shadow-[0_0_120px_-30px_rgba(201,163,59,0.6)]"
          : "border-[rgba(234,227,210,0.18)] bg-[rgba(11,11,13,0.45)] hover:border-[rgba(201,163,59,0.6)]"
      )}
    >
      <input
        id={inputId}
        type="file"
        multiple
        accept={ACCEPT}
        onChange={onPick}
        className="sr-only"
      />

      {/* Drifting scan line — every 4.5s, a thin gold hairline sweeps
          top-to-bottom. Tells the user this zone is "alive and reading." */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(201,163,59,0.85), transparent)",
          boxShadow: "0 0 12px rgba(201,163,59,0.6)",
        }}
        initial={{ top: "0%", opacity: 0 }}
        animate={{
          top: ["0%", "100%"],
          opacity: [0, 0.9, 0.9, 0],
        }}
        transition={{
          duration: 3.6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.9,
        }}
      />

      {/* Hairline grid revealed only when actively dragging — the
          "scanning surface" gesture */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-300",
          dragging ? "opacity-30" : "opacity-0"
        )}
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(216,184,104,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(216,184,104,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5 px-6">
        <UploadIcon dragging={dragging} />
        <div>
          <p className="font-[var(--font-fraunces)] text-2xl text-[var(--bone)] lg:text-3xl">
            {dragging ? (
              <span className="italic text-[var(--gold-soft)]">
                Release to index
              </span>
            ) : (
              <>
                Drop files here, or{" "}
                <span className="italic text-[var(--gold-soft)] gold-glow-text">
                  browse
                </span>
              </>
            )}
          </p>
          <p className="mt-3 text-[10.5px] uppercase tracking-[0.32em] text-[var(--mist)]">
            Images · PDF · DWG · Up to 50 MB each
          </p>
        </div>
      </div>
    </label>
  );
}

function UploadIcon({ dragging }: { dragging: boolean }) {
  return (
    <motion.div
      animate={{
        y: dragging ? -6 : 0,
        scale: dragging ? 1.1 : 1,
      }}
      transition={{ duration: 0.6, ease: ease.luxe }}
      className="relative h-14 w-14"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border border-[rgba(201,163,59,0.4)]"
      />
      <span
        aria-hidden
        className="absolute inset-2 rounded-full border border-[rgba(201,163,59,0.25)]"
      />
      <svg
        className="absolute inset-0 m-auto"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden
      >
        <path
          d="M11 16V4M11 4L5 10M11 4l6 6"
          stroke="var(--gold-soft)"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 18h16"
          stroke="var(--gold)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

/* ============================================================================
 * File card — one per uploaded reference
 * ========================================================================== */

function FileCard({
  file,
  onRemove,
}: {
  file: UploadedFile;
  onRemove: () => void;
}) {
  const [indexed, setIndexed] = useState(false);

  // The "AI scan" — runs once on mount, then the card transitions into
  // a steady "indexed" state with a quiet gold dot.
  useEffect(() => {
    const t = setTimeout(() => setIndexed(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.6, ease: ease.luxe }}
      className="group relative isolate flex items-center gap-4 overflow-hidden rounded-xl border border-[rgba(234,227,210,0.1)] bg-[rgba(11,11,13,0.7)] p-4 transition-colors hover:border-[rgba(201,163,59,0.45)]"
    >
      {/* AI scan sweep — diagonal gold band that travels across the card once */}
      <AnimatePresence>
        {!indexed && (
          <motion.span
            key="scan"
            aria-hidden
            className="absolute inset-y-0 -left-1/2 z-0 w-1/2"
            style={{
              background:
                "linear-gradient(115deg, transparent 0%, rgba(216,184,104,0.4) 50%, transparent 100%)",
              filter: "blur(6px)",
            }}
            initial={{ x: 0 }}
            animate={{ x: "300%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Thumb */}
      <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[rgba(234,227,210,0.1)] bg-[var(--coal)]">
        {file.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <FileGlyph type={file.type} />
        )}
      </div>

      {/* Meta */}
      <div className="relative z-10 min-w-0 flex-1">
        <p className="truncate text-sm text-[var(--bone)]">{file.name}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-[var(--whisper)]">
          {formatBytes(file.size)} · {indexed ? "Indexed" : "Reading…"}
        </p>
      </div>

      {/* Status pip */}
      <span
        aria-hidden
        className={cn(
          "relative z-10 h-2 w-2 rounded-full transition-colors duration-500",
          indexed ? "bg-[var(--gold-soft)]" : "bg-[rgba(216,184,104,0.4)]"
        )}
        style={{
          boxShadow: indexed ? "0 0 10px rgba(201,163,59,0.7)" : "none",
        }}
      />

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        data-cursor="link"
        aria-label={`Remove ${file.name}`}
        className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(234,227,210,0.12)] text-[var(--mist)] transition-colors hover:border-[rgba(201,163,59,0.4)] hover:text-[var(--gold-soft)]"
      >
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path
            d="M1 1l8 8M9 1l-8 8"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </motion.div>
  );
}

function FileGlyph({ type }: { type: string }) {
  const isPdf = /pdf/i.test(type);
  const isDwg = /dwg|dxf|acad/i.test(type);
  const label = isPdf ? "PDF" : isDwg ? "DWG" : "FILE";
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--gold-soft)]">
      <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden>
        <path
          d="M2 1h9l5 5v15H2V1Z"
          stroke="currentColor"
          strokeWidth="0.8"
        />
        <path d="M11 1v5h5" stroke="currentColor" strokeWidth="0.8" />
      </svg>
      <span className="text-[8px] uppercase tracking-[0.18em]">{label}</span>
    </div>
  );
}

/* ---------- helpers ---------- */
function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function guessTypeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image/" + ext;
  if (ext === "pdf") return "application/pdf";
  if (["dwg", "dxf"].includes(ext)) return "application/acad";
  return "application/octet-stream";
}
