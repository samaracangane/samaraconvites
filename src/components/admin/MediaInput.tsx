import { useState } from "react";
import { uploadMedia } from "@/lib/admin-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload } from "lucide-react";

type Props = {
  label: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  accept?: string;
  folder?: string;
};

export function MediaInput({ label, value, onChange, accept = "image/*", folder = "uploads" }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Mídia enviada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  const isVideo = value && /\.(mp4|webm|mov)(\?|$)/i.test(value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL da mídia ou envie um arquivo"
          />
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted">
          <Upload className="h-4 w-4" />
          {busy ? "Enviando..." : "Enviar arquivo"}
          <input type="file" accept={accept} className="hidden" onChange={handleFile} disabled={busy} />
        </label>
      </div>
      {value && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border/60 bg-muted/30 p-2">
          {isVideo ? (
            <video src={value} controls className="max-h-48 w-full rounded" />
          ) : (
            <img src={value} alt="" className="max-h-48 rounded object-contain" />
          )}
        </div>
      )}
    </div>
  );
}
