import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";

export type BaseRow = {
  id: string;
  sort_order?: number;
  active?: boolean;
};

type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function ResourceTable<T extends BaseRow>({
  rows,
  columns,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
  showActiveToggle = true,
  showReorder = true,
}: {
  rows: T[];
  columns: Column<T>[];
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  onToggleActive?: (row: T, next: boolean) => void;
  onMove?: (row: T, direction: -1 | 1) => void;
  showActiveToggle?: boolean;
  showReorder?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card p-10 text-center text-sm text-muted-foreground">
        Nenhum item cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {showReorder && <th className="w-16 px-3 py-3 text-left">Ordem</th>}
              {columns.map((c, i) => (
                <th key={i} className={`px-3 py-3 text-left ${c.className ?? ""}`}>
                  {c.header}
                </th>
              ))}
              {showActiveToggle && <th className="w-24 px-3 py-3 text-left">Ativo</th>}
              <th className="w-32 px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30">
                {showReorder && (
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onMove?.(row, -1)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted"
                        aria-label="Subir"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onMove?.(row, 1)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted"
                        aria-label="Descer"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                )}
                {columns.map((c, i) => (
                  <td key={i} className={`px-3 py-3 ${c.className ?? ""}`}>
                    {c.cell(row)}
                  </td>
                ))}
                {showActiveToggle && (
                  <td className="px-3 py-3">
                    <Switch
                      checked={!!row.active}
                      onCheckedChange={(v) => onToggleActive?.(row, v)}
                    />
                  </td>
                )}
                <td className="px-3 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
