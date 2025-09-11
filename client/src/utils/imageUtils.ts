import { FALLBACK_IMAGE_URL } from "@/config";

const CLOUDFRONT_URL = import.meta.env.VITE_CLOUDFRONT_URL as string | undefined;
let warnedMissingBase = false;

export function getImageUrls(imageKeys: string[] | undefined): string[] {
  const keys = Array.isArray(imageKeys) ? imageKeys.filter(Boolean) : [];
  if (!keys.length) {
    return [FALLBACK_IMAGE_URL];
  }
  const base = (CLOUDFRONT_URL || '').replace(/\/$/, '');

  if (!base && !warnedMissingBase) {
    warnedMissingBase = true;
    // eslint-disable-next-line no-console
    console.warn("VITE_CLOUDFRONT_URL is not set. Serving images using original keys/paths.");
  }

  return keys.map((key) => {
    const k = key || '';
    // If it's already an absolute URL, return as-is
    if (/^https?:\/\//i.test(k)) return k;
    if (!base) {
      // Keep original key/path unchanged when base is missing
      return k;
    }
    const normalizedKey = k.replace(/^\/+/, '');
    return `${base}/${normalizedKey}`;
  });
}
