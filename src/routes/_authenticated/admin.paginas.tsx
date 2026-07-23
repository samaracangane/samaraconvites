import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, ResourceTable } from "@/components/admin/ResourceTable";
import { useResourceList, useResourceMutations } from "@/lib/admin-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/paginas")({
  component: PagesAdmin,
});

type Page = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  active: boolean;
};

function PagesAdmin() {
  const { data: rows = [] } = useResourceList<Page>("pages", "title");
  const { upsert, remove, patch } = useResourceMutations("pages");
  const [editing, setEditing] = useState<Partial<Page> | null>(null);

  return (
    <div>
      <PageHeader
        title="Páginas"
        description="Conteúdo institucional editável (ex: sobre, contato, política)."
        action={
          <Button onClick={() => setEditing({ active: true })}>
            <Plus className="mr-1 h-4 w-4" /> Nova página
          </Button>
        }
      />
      <ResourceTable
        rows={rows}
        showReorder={false}
        onEdit={(r) => setEditing(r)}
        onDelete={(r) => confirm(`Remover "${r.title}"?`) && remove.mutate(r.id)}
        onToggleActive={(r, v) => patch.mutate({ id: r.id, values: { active: v } })}
        columns={[
          { header: "Título", cell: (r) => <span className="font-medium">{r.title}</span> },
          { header: "Slug", cell: (r) => <code className="text-xs text-muted-foreground">/{r.slug}</code> },
        ]}
      />

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar página" : "Nova página"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <PageForm value={editing} onCancel={() => setEditing(null)} onSubmit={async (v) => { await upsert.mutateAsync(v); setEditing(null); }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PageForm({ value, onSubmit, onCancel }: { value: Partial<Page>; onSubmit: (v: Partial<Page>) => Promise<void>; onCancel: () => void }) {
  const [v, setV] = useState<Partial<Page>>(value);
  const set = <K extends keyof Page>(k: K, val: Page[K] | null) => setV((p) => ({ ...p, [k]: val }));
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(v); }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <F label="Título"><Input required value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} /></F>
        <F label="Slug"><Input required pattern="[a-z0-9-]+" value={v.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></F>
      </div>
      <F label="Meta description (SEO)"><Input value={v.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} /></F>
      <F label="Conteúdo (Markdown/HTML)"><Textarea rows={10} value={v.content ?? ""} onChange={(e) => set("content", e.target.value)} /></F>
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
