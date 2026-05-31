const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function resolveMediaUrl(src?: string | null): string {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  if (src.startsWith("/media/")) {
    return `${DEFAULT_API_BASE_URL}${src}`;
  }
  if (src.startsWith("media/")) {
    return `${DEFAULT_API_BASE_URL}/${src}`;
  }
  if (src.startsWith("/")) {
    return `${DEFAULT_API_BASE_URL}${src}`;
  }
  return `${DEFAULT_API_BASE_URL}/${src}`;
}