import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, ResourceTable } from "@/components/admin/ResourceTable";
import { MediaInput } from "@/components/admin/MediaInput";
import { useResourceList, useResourceMutations } from "@/lib/admin-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: BannersAdmin,
});

type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  cta_label: string | null;
  position: string;
  sort_order: number;
  active: boolean;
};

const empty: Partial<Banner> = { position: "hero", sort_order: 0, active: true };

function BannersAdmin() {
  const { data: rows = [] } = useResourceList<Banner>("banners");
  const { upsert, remove, patch } = useResourceMutations("banners");
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);

  function move(row: Banner, dir: -1 | 1) {
    const list = [...rows].sort((a, b) => a.sort_order - b.sort_order);
    const idx = list.findIndex((r) => r.id === row.id);
    const swap = list[idx + dir];
    if (!swap) return;
    patch.mutate({ id: row.id, values: { sort_order: swap.sort_order } });
    patch.mutate({ id: swap.id, values: { sort_order: row.sort_order } });
  }

  return (
    <div>
      <PageHeader
        title="Banners"
        description="Faixas visuais exibidas na home e outras seções."
        action={
          <Button onClick={() => setEditing({ ...empty, sort_order: rows.length })}>
            <Plus className="mr-1 h-4 w-4" /> Novo banner
          </Button>
        }
      />
      <ResourceTable
        rows={rows}
        onEdit={(r) => setEditing(r)}
        onDelete={(r) => confirm(`Remover banner?`) && remove.mutate(r.id)}
        onToggleActive={(r, v) => patch.mutate({ id: r.id, values: { active: v } })}
        onMove={move}
        columns={[
          {
            header: "Banner",
            cell: (r) => (
              <div className="flex items-center gap-3">
                {r.image_url && <img src={r.image_url} alt="" className="h-10 w-16 rounded object-cover" />}
                <div>
                  <div className="font-medium">{r.title ?? "(sem título)"}</div>
                  <div className="text-xs text-muted-foreground">{r.subtitle}</div>
                </div>
              </div>
            ),
          },
          { header: "Posição", cell: (r) => r.position },
          { header: "Link", cell: (r) => <span className="text-xs text-muted-foreground">{r.link_url ?? "—"}</span> },
        ]}
      />

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar banner" : "Novo banner"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <BannerForm value={editing} onCancel={() => setEditing(null)} onSubmit={async (v) => { await upsert.mutateAsync(v); setEditing(null); }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BannerForm({ value, onSubmit, onCancel }: { value: Partial<Banner>; onSubmit: (v: Partial<Banner>) => Promise<void>; onCancel: () => void }) {
  const [v, setV] = useState<Partial<Banner>>(value);
  const set = <K extends keyof Banner>(k: K, val: Banner[K] | null) => setV((p) => ({ ...p, [k]: val }));

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(v); }}>
      <F label="Título"><Input value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} /></F>
      <F label="Subtítulo"><Input value={v.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></F>
      <div className="grid gap-3 sm:grid-cols-2">
        <F label="Posição">
          <Select value={v.position ?? "hero"} onValueChange={(val) => set("position", val)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hero">Hero (topo)</SelectItem>
              <SelectItem value="middle">Meio da home</SelectItem>
              <SelectItem value="footer">Rodapé</SelectItem>
            </SelectContent>
          </Select>
        </F>
        <F label="Texto do botão (CTA)"><Input value={v.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} /></F>
      </div>
      <F label="Link do botão"><Input placeholder="/categoria/princesas" value={v.link_url ?? ""} onChange={(e) => set("link_url", e.target.value)} /></F>
      <MediaInput label="Imagem" value={v.image_url} onChange={(url) => set("image_url", url)} folder="banners" />
      <MediaInput label="Vídeo (opcional)" value={v.video_url} onChange={(url) => set("video_url", url)} accept="video/*" folder="banners" />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div className="space-y-1.5"><Label className="text-sm">{label}</Label>{children}</div>);
}
