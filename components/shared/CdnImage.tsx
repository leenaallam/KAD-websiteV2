import Image, { type ImageProps } from "next/image";
import { cdn } from "@/lib/cdn";
import type { AssetEntry } from "@/types/assets";

type Props = Omit<ImageProps, "src" | "placeholder" | "blurDataURL"> & {
  asset: AssetEntry;
  /** Default sizes string for responsive selection. */
  sizes?: string;
};

/**
 * Renders a manifest asset through Next/Image. Picks the largest variant
 * the pipeline emitted as the canonical src and lets Next handle responsive
 * selection via `sizes`. The LQIP from the manifest powers the blur-up
 * placeholder.
 *
 * Supports both `fill` and intrinsic-sized usage. Width/height are only
 * passed when `fill` isn't (Next/Image rejects having both).
 */
export function CdnImage({ asset, alt, sizes, ...rest }: Props) {
  const largest = asset.variants[asset.variants.length - 1];
  if (!largest) return null;

  const commonProps = {
    src: cdn(largest.path),
    placeholder: "blur" as const,
    blurDataURL: asset.lqip,
    sizes:
      sizes ?? "(min-width: 1280px) 1280px, (min-width: 768px) 100vw, 100vw",
    alt: alt || asset.originalName,
  };

  if ("fill" in rest && rest.fill) {
    return <Image {...rest} {...commonProps} />;
  }

  return (
    <Image
      {...rest}
      {...commonProps}
      width={asset.originalWidth}
      height={asset.originalHeight}
    />
  );
}
