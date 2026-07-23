import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, ResourceTable } from "@/components/admin/ResourceTable";
import { useResourceList, useResourceMutations } from "@/lib/admin-queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/vitrines")({
  component: ShowcasesAdmin,
});

type Showcase = { id: string; slug: string; title: string; subtitle: string | null; sort_order: number; active: boolean };
type Product = { id: string; title: string; image_url: string | null };
type Item = { id: string; showcase_id: string; product_id: string; sort_order: number };

function ShowcasesAdmin() {
  const { data: rows = [] } = useResourceList<Showcase>("showcases");
  const { upsert, remove, patch } = useResourceMutations("showcases");
  const [editing, setEditing] = useState<Partial<Showcase> | null>(null);
  const [managing, setManaging] = useState<Showcase | null>(null);

  function move(row: Showcase, dir: -1 | 1) {
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
        title="Vitrines"
        description="Grupos de produtos exibidos na home (ex: Destaques, Novidades)."
        action={
          <Button onClick={() => setEditing({ active: true, sort_order: rows.length })}>
            <Plus className="mr-1 h-4 w-4" /> Nova vitrine
          </Button>
        }
      />
      <ResourceTable
        rows={rows}
        onEdit={(r) => setEditing(r)}
        onDelete={(r) => confirm(`Remover "${r.title}"?`) && remove.mutate(r.id)}
        onToggleActive={(r, v) => patch.mutate({ id: r.id, values: { active: v } })}
        onMove={move}
        columns={[
          { header: "Título", cell: (r) => <span className="font-medium">{r.title}</span> },
          { header: "Slug", cell: (r) => <code className="text-xs text-muted-foreground">{r.slug}</code> },
          {
            header: "Produtos",
            cell: (r) => (
              <Button size="sm" variant="outline" onClick={() => setManaging(r)}>Gerenciar</Button>
            ),
          },
        ]}
      />

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing?.id ? "Editar vitrine" : "Nova vitrine"}</DialogTitle></DialogHeader>
          {editing && <ShowcaseForm value={editing} onCancel={() => setEditing(null)} onSubmit={async (v) => { await upsert.mutateAsync(v); setEditing(null); }} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!managing} onOpenChange={(v) => !v && setManaging(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Produtos em "{managing?.title}"</DialogTitle></DialogHeader>
          {managing && <ManageItems showcase={managing} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShowcaseForm({ value, onSubmit, onCancel }: { value: Partial<Showcase>; onSubmit: (v: Partial<Showcase>) => Promise<void>; onCancel: () => void }) {
  const [v, setV] = useState<Partial<Showcase>>(value);
  const set = <K extends keyof Showcase>(k: K, val: Showcase[K] | null) => setV((p) => ({ ...p, [k]: val }));
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(v); }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Título</Label><Input required value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Slug</Label><Input required pattern="[a-z0-9-]+" value={v.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></div>
      </div>
      <div className="space-y-1.5"><Label>Subtítulo</Label><Input value={v.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

function ManageItems({ showcase }: { showcase: Showcase }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["showcase_items", showcase.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("showcase_items")
        .select("*")
        .eq("showcase_id", showcase.id)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Item[];
    },
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products_all"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, title, image_url").order("title");
      return (data ?? []) as Product[];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["showcase_items", showcase.id] });

  const add = useMutation({
    mutationFn: async (product_id: string) => {
      const { error } = await supabase.from("showcase_items").insert({
        showcase_id: showcase.id, product_id, sort_order: items.length,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("showcase_items").delete().eq("id", id); },
    onSuccess: invalidate,
  });
  const swap = useMutation({
    mutationFn: async ({ a, b }: { a: Item; b: Item }) => {
      await supabase.from("showcase_items").update({ sort_order: b.sort_order }).eq("id", a.id);
      await supabase.from("showcase_items").update({ sort_order: a.sort_order }).eq("id", b.id);
    },
    onSuccess: invalidate,
  });

  const [selected, setSelected] = useState("");
  const available = products.filter((p) => !items.some((i) => i.product_id === p.id));
  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select className="flex-1 rounded-md border border-input bg-background px-2 text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Selecione um produto para adicionar…</option>
          {available.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <Button disabled={!selected} onClick={() => { add.mutate(selected); setSelected(""); }}>Adicionar</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum produto na vitrine ainda.</p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card">
          {items.map((it, idx) => {
            const p = productMap.get(it.product_id);
            return (
              <li key={it.id} className="flex items-center gap-3 p-3">
                {p?.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
                <span className="flex-1 text-sm">{p?.title ?? "(produto removido)"}</span>
                <button className="p-1 text-muted-foreground hover:text-foreground" disabled={idx === 0} onClick={() => swap.mutate({ a: it, b: items[idx - 1] })}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button className="p-1 text-muted-foreground hover:text-foreground" disabled={idx === items.length - 1} onClick={() => swap.mutate({ a: it, b: items[idx + 1] })}>
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button className="p-1 text-destructive" onClick={() => del.mutate(it.id)}>
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
