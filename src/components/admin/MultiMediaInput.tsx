import { useState } from "react";
import { uploadMedia } from "@/lib/admin-media";
import { toast } from "sonner";
import { Upload, X, ArrowLeft, ArrowRight } from "lucide-react";

type Props = {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
};

export function MultiMediaInput({ label, value, onChange, folder = "uploads" }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = await Promise.all(files.map((f) => uploadMedia(f, folder)));
      onChange([...(value ?? []), ...urls]);
      toast.success(`${urls.length} imagem(ns) enviada(s)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted">
          <Upload className="h-4 w-4" />
          {busy ? "Enviando..." : "Adicionar imagens"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
            disabled={busy}
          />
        </label>
      </div>
      {value?.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url, i) => (
            <div key={i} className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted">
              <img src={url} alt="" className="aspect-[9/16] w-full object-cover" />
              <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={() => move(i, -1)} className="rounded bg-background/90 p-1"><ArrowLeft className="h-3 w-3" /></button>
                <button type="button" onClick={() => move(i, 1)} className="rounded bg-background/90 p-1"><ArrowRight className="h-3 w-3" /></button>
                <button type="button" onClick={() => remove(i)} className="rounded bg-destructive p-1 text-destructive-foreground"><X className="h-3 w-3" /></button>
              </div>
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">Capa</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
