import supabase from "../lib/supabase.ts";

export async function getImageUrl(
  path: string | null,
  bucket: string,
): Promise<string | null> {
  if (!path || /^https?:\/\//i.test(path)) {
    return path || null;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600); // Available for 1h.

  if (error) {
    console.error("Failed to sign image URL:", error.message);
    return null;
  }

  return data.signedUrl;
}

export async function batchGetImageUrls(
  paths: (string | null)[],
  bucket: string,
): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  const storagePaths: string[] = [];

  // Set removes duplicate paths.
  for (const path of new Set(paths)) {
    if (!path) continue;

    if (/^https?:\/\//i.test(path)) {
      // Already a complete URL, such as a GitHub avatar.
      urls.set(path, path);
    } else {
      storagePaths.push(path);
    }
  }

  if (storagePaths.length === 0) return urls;

  // ONE request for all stored paths in this bucket.
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(storagePaths, 3600); // 1h

  if (error) {
    console.error("Failed to sign image URLs:", error.message);
    return urls;
  }

  for (const item of data) {
    if (item.error || !item.path || !item.signedUrl) {
      console.error("Failed to sign image:", item.error ?? item.path);
      continue;
    }

    urls.set(item.path, item.signedUrl);
  }

  return urls;
}
