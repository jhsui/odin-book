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
    .createSignedUrl(path, 3600);

  if (error) {
    console.error("Failed to sign image URL:", error.message);
    return null;
  }

  return data.signedUrl;
}
