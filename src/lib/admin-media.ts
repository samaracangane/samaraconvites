import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";
// 10 years — long-lived signed URL because the bucket is private.
const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10;

export async function uploadMedia(file: File, folder = "uploads"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS_SECONDS);
  if (error || !data?.signedUrl) throw error ?? new Error("Falha ao gerar URL");
  return data.signedUrl;
}
