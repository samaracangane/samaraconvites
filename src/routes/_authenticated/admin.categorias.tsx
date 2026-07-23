import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, ResourceTable } from "@/components/admin/ResourceTable";
import { MediaInput } from "@/components/admin/MediaInput";
import { useResourceList, useResourceMutations } from "@/lib/admin-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  component: CategoriesAdmin,
});

type Category = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  color: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

const empty: Partial<Category> = { name: "", slug: "", emoji: "", color: "blush", sort_order: 0, active: true };

function CategoriesAdmin() {
  const { data: rows = [] } = useResourceList<Category>("categories");
  const { upsert, remove, patch } = useResourceMutations("categories");
  const [editing, setEditing] = useState<Partial<Category> | null>(null);

  function move(row: Category, dir: -1 | 1) {
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
        title="Categorias"
        description="Temas de convites que aparecem na navegação da loja."
        action={
          <Button onClick={() => setEditing({ ...empty, sort_order: rows.length })}>
            <Plus className="mr-1 h-4 w-4" /> Nova categoria
          </Button>
        }
      />
      <ResourceTable
        rows={rows}
        onEdit={(r) => setEditing(r)}
        onDelete={(r) => confirm(`Remover "${r.name}"?`) && remove.mutate(r.id)}
        onToggleActive={(r, v) => patch.mutate({ id: r.id, values: { active: v } })}
        onMove={move}
        columns={[
          {
            header: "Nome",
            cell: (r) => (
              <div className="flex items-center gap-2">
                <span className="text-lg">{r.emoji ?? "🏷️"}</span>
                <span className="font-medium">{r.name}</span>
              </div>
            ),
          },
          { header: "Slug", cell: (r) => <code className="text-xs text-muted-foreground">{r.slug}</code> },
        ]}
      />

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <CategoryForm
              value={editing}
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

function CategoryForm({
  value,
  onSubmit,
  onCancel,
}: {
  value: Partial<Category>;
  onSubmit: (v: Partial<Category>) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<Partial<Category>>(value);
  const set = <K extends keyof Category>(k: K, val: Category[K] | null) =>
    setV((prev) => ({ ...prev, [k]: val }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome">
          <Input required value={v.name ?? ""} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Slug (URL)">
          <Input
            required
            pattern="[a-z0-9-]+"
            value={v.slug ?? ""}
            onChange={(e) => set("slug", e.target.value)}
          />
        </Field>
        <Field label="Emoji">
          <Input value={v.emoji ?? ""} onChange={(e) => set("emoji", e.target.value)} />
        </Field>
        <Field label="Cor (blush, sky, lilac, sunny, mint, cream)">
          <Input value={v.color ?? ""} onChange={(e) => set("color", e.target.value)} />
        </Field>
      </div>
      <MediaInput
        label="Imagem (opcional)"
        value={v.image_url}
        onChange={(url) => set("image_url", url)}
        folder="categorias"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
