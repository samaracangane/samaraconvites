import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, ResourceTable } from "@/components/admin/ResourceTable";
import { MediaInput } from "@/components/admin/MediaInput";
import { MultiMediaInput } from "@/components/admin/MultiMediaInput";
import { useResourceList, useResourceMutations } from "@/lib/admin-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/produtos")({
  component: ProductsAdmin,
});

type Product = {
  id: string;
  slug: string;
  title: string;
  category_id: string | null;
  type: "imagem" | "video";
  price: number;
  old_price: number | null;
  image_url: string | null;
  video_url: string | null;
  gallery: string[] | null;
  description: string | null;
  delivery_hours: number;
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  is_new: boolean;
  on_sale: boolean;
  sort_order: number;
  active: boolean;
  cover_index: number;
  kiwify_checkout_url: string | null;
};

type Category = { id: string; name: string };

const empty: Partial<Product> = {
  title: "",
  slug: "",
  type: "imagem",
  price: 0,
  delivery_hours: 24,
  tags: [],
  featured: false,
  bestseller: false,
  is_new: false,
  on_sale: false,
  sort_order: 0,
  active: true,
  cover_index: 0,
};

function ProductsAdmin() {
  const { data: rows = [] } = useResourceList<Product>("products");
  const { data: cats = [] } = useResourceList<Category>("categories", "name");
  const { upsert, remove, patch } = useResourceMutations("products");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  function move(row: Product, dir: -1 | 1) {
    const list = [...rows].sort((a, b) => a.sort_order - b.sort_order);
    const idx = list.findIndex((r) => r.id === row.id);
    const swap = list[idx + dir];
    if (!swap) return;
    patch.mutate({ id: row.id, values: { sort_order: swap.sort_order } });
    patch.mutate({ id: swap.id, values: { sort_order: row.sort_order } });
  }

  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Convites disponíveis na loja."
        action={
          <Button onClick={() => setEditing({ ...empty, sort_order: rows.length })}>
            <Plus className="mr-1 h-4 w-4" /> Novo produto
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
          {
            header: "Produto",
            cell: (r) => (
              <div className="flex items-center gap-2">
                {r.image_url && <img src={r.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
                <div>
                  <div className="font-medium">{r.title}</div>
                  <code className="text-[11px] text-muted-foreground">{r.slug}</code>
                </div>
              </div>
            ),
          },
          { header: "Categoria", cell: (r) => catName(r.category_id) },
          { header: "Tipo", cell: (r) => (r.type === "video" ? "Vídeo" : "Imagem") },
          {
            header: "Preço",
            cell: (r) =>
              Number(r.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          },
        ]}
      />

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar produto" : "Novo produto"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProductForm
              value={editing}
              categories={cats}
              onCancel={() => setEditing(null)}
              onSubmit={async (v) => {
                await upsert.mutateAsync(v);
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({
  value,
  categories,
  onSubmit,
  onCancel,
}: {
  value: Partial<Product>;
  categories: Category[];
  onSubmit: (v: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<Partial<Product>>(value);
  const set = <K extends keyof Product>(k: K, val: Product[K] | null) =>
    setV((prev) => ({ ...prev, [k]: val as Product[K] }));

  const tagsText = (v.tags ?? []).join(", ");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...v, price: Number(v.price) || 0, old_price: v.old_price ? Number(v.old_price) : null });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <F label="Título">
          <Input required value={v.title ?? ""} onChange={(e) => set("title", e.target.value)} />
        </F>
        <F label="Slug (URL)">
          <Input required pattern="[a-z0-9-]+" value={v.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
        </F>
        <F label="Categoria">
          <Select value={v.category_id ?? "none"} onValueChange={(val) => set("category_id", val === "none" ? null : val)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— sem categoria —</SelectItem>
              {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </F>
        <F label="Tipo">
          <Select value={v.type ?? "imagem"} onValueChange={(val) => set("type", val as "imagem" | "video")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="imagem">Imagem</SelectItem>
              <SelectItem value="video">Vídeo</SelectItem>
            </SelectContent>
          </Select>
        </F>
        <F label="Preço (R$)">
          <Input type="number" step="0.01" required value={v.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
        </F>
        <F label="Preço antigo (opcional)">
          <Input type="number" step="0.01" value={v.old_price ?? ""} onChange={(e) => set("old_price", e.target.value ? Number(e.target.value) : null)} />
        </F>
        <F label="Prazo de entrega (horas)">
          <Input type="number" value={v.delivery_hours ?? 24} onChange={(e) => set("delivery_hours", Number(e.target.value))} />
        </F>
        <F label="Tags (separadas por vírgula)">
          <Input
            value={tagsText}
            onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          />
        </F>
      </div>

      <F label="Descrição">
        <Textarea rows={3} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
      </F>

      <MediaInput label="Imagem principal (capa)" value={v.image_url} onChange={(url) => set("image_url", url)} folder="produtos" />
      <MultiMediaInput
        label="Galeria de imagens (9:16)"
        value={v.gallery ?? []}
        onChange={(urls) => set("gallery", urls)}
        folder="produtos"
      />
      <MediaInput
        label="Vídeo (opcional — exibido como primeira mídia quando o tipo for Vídeo)"
        value={v.video_url}
        onChange={(url) => set("video_url", url)}
        accept="video/*"
        folder="produtos"
      />
      <F label="Link de checkout Kiwify (opcional)">
        <Input
          type="url"
          placeholder="https://pay.kiwify.com.br/abc123"
          value={v.kiwify_checkout_url ?? ""}
          onChange={(e) => set("kiwify_checkout_url", e.target.value ? e.target.value : null)}
        />
      </F>

      <F label="Primeira mídia exibida na página do produto">
        <Select
          value={String(v.cover_index ?? 0)}
          onValueChange={(val) => set("cover_index", Number(val))}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {v.video_url && <SelectItem value="-1">🎬 Vídeo</SelectItem>}
            {(v.gallery ?? []).map((_, i) => (
              <SelectItem key={i} value={String(i)}>Imagem {i + 1} da galeria</SelectItem>
            ))}
            {(!v.gallery || v.gallery.length === 0) && !v.video_url && (
              <SelectItem value="0">Imagem principal (capa)</SelectItem>
            )}
          </SelectContent>
        </Select>
      </F>


      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 sm:grid-cols-4">
        {(["featured","bestseller","is_new","on_sale"] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <Switch checked={!!v[k]} onCheckedChange={(val) => set(k, val)} />
            {k === "featured" ? "Destaque" : k === "bestseller" ? "Top" : k === "is_new" ? "Novo" : "Promo"}
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
