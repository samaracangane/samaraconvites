import { createServerFn } from "@tanstack/react-start";

// 15 MB por arquivo — suficiente para foto do aniversariante e música.
const MAX_BYTES = 15 * 1024 * 1024;
const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10;
const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "heic",
  "mp3", "wav", "m4a", "ogg", "aac",
]);

/**
 * Upload de mídia do pedido (foto/música) feito por clientes anônimas.
 * Passa pelo servidor com credencial privilegiada porque o bucket é privado —
 * o navegador nunca ganha acesso de escrita direto ao armazenamento.
 */
export const uploadOrderMedia = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Upload inválido");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Arquivo ausente");
    return { file };
  })
  .handler(async ({ data }): Promise<{ url: string }> => {
    const { file } = data;
    if (file.size <= 0 || file.size > MAX_BYTES) {
      throw new Error("Arquivo inválido ou maior que 15 MB");
    }
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    const isAllowedType =
      file.type.startsWith("image/") || file.type.startsWith("audio/");
    if (!isAllowedType && !ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error("Tipo de arquivo não permitido");
    }

    const path = `orders/${crypto.randomUUID()}.${ext || "bin"}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: uploadError } = await supabaseAdmin.storage
      .from("media")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (uploadError) throw uploadError;

    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("media")
      .createSignedUrl(path, TEN_YEARS_SECONDS);
    if (signError || !signed?.signedUrl) {
      throw signError ?? new Error("Falha ao gerar URL do arquivo");
    }
    return { url: signed.signedUrl };
  });
