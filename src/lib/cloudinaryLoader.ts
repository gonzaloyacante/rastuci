"use client";

/**
 * Cloudinary Image Loader for Next.js
 * Automatically applies f_auto (format) and q_auto (quality) transformations
 * for optimal image delivery from Cloudinary CDN.
 */

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface CloudinaryLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom loader for next/image that optimizes Cloudinary URLs
 * with automatic format and quality selection.
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: CloudinaryLoaderParams): string {
  // If it's already a Cloudinary URL, add optimizations
  if (src.includes("res.cloudinary.com")) {
    // Parse existing URL to inject transformations
    const url = new URL(src);
    const pathParts = url.pathname.split("/");

    // Find the 'upload' segment and inject transformations after it
    const uploadIndex = pathParts.findIndex((part) => part === "upload");

    if (uploadIndex !== -1) {
      // Build transformation string
      const transforms = [
        `w_${width}`,
        `q_${quality || "auto"}`,
        `f_auto`,
        `c_limit`, // Limit to width without upscaling
      ].join(",");

      // Check if there's already a version segment (v1234...)
      const nextPart = pathParts[uploadIndex + 1];
      const hasVersion = nextPart && /^v\d+$/.test(nextPart);

      if (hasVersion) {
        // Insert transforms between upload and version
        pathParts.splice(uploadIndex + 1, 0, transforms);
      } else {
        // Insert transforms right after upload
        pathParts.splice(uploadIndex + 1, 0, transforms);
      }

      url.pathname = pathParts.join("/");
      return url.toString();
    }
  }

  // For Unsplash, append width and quality params
  if (src.includes("images.unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("q", (quality || "auto").toString());
    return url.toString();
  }

  // For non-Cloudinary/Unsplash URLs or if parsing failed, return as-is
  return src;
}

/**
 * Get optimized Cloudinary URL for a given public ID
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | "auto";
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
    crop?: "fill" | "scale" | "fit" | "limit" | "thumb";
  } = {}
): string {
  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "limit",
  } = options;

  if (!cloudName) throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME missing");
  const transforms: string[] = [];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);

  const transformString = transforms.join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

/**
 * Generate a tiny Cloudinary blur placeholder URL (LQIP).
 * Returns a ~10px wide, very low quality image URL for use as blurDataURL.
 */
export function getCloudinaryBlurUrl(src: string): string {
  if (!src || !src.includes("res.cloudinary.com")) return "";

  try {
    const url = new URL(src);
    const pathParts = url.pathname.split("/");
    const uploadIndex = pathParts.findIndex((part) => part === "upload");

    if (uploadIndex === -1) return "";

    const blurTransforms = "w_10,q_1,f_auto,e_blur:200";

    // Remove any existing transform segments (between upload and version/public_id)
    const nextPart = pathParts[uploadIndex + 1];
    const hasVersion = nextPart && /^v\d+$/.test(nextPart);
    const hasExistingTransforms =
      nextPart && !hasVersion && nextPart.includes("_");

    if (hasExistingTransforms) {
      pathParts[uploadIndex + 1] = blurTransforms;
    } else {
      pathParts.splice(uploadIndex + 1, 0, blurTransforms);
    }

    url.pathname = pathParts.join("/");
    return url.toString();
  } catch {
    return "";
  }
}

export default cloudinaryLoader;
