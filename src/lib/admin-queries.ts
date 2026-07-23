import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TableName = "products" | "categories" | "banners" | "pages" | "showcases" | "showcase_items";

export function useResourceList<T>(table: TableName, order: string = "sort_order") {
  return useQuery({
    queryKey: [table, "list"],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order(order, { ascending: true });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useResourceMutations(table: TableName) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [table] });
    qc.invalidateQueries({ queryKey: ["count", table] });
    qc.invalidateQueries({ queryKey: ["public"] });
  };

  const upsert = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { error } = await supabase.from(table).upsert(row as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Salvo");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removido");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover"),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await supabase.from(table).update(values as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return { upsert, remove, patch };
}
