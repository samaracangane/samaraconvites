import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Tags, Image as ImageIcon, LayoutList, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function useCount(table: "products" | "categories" | "banners" | "showcases" | "pages") {
  return useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
}

function Dashboard() {
  const items = [
    { to: "/admin/produtos", label: "Produtos", icon: Package, table: "products" as const },
    { to: "/admin/categorias", label: "Categorias", icon: Tags, table: "categories" as const },
    { to: "/admin/banners", label: "Banners", icon: ImageIcon, table: "banners" as const },
    { to: "/admin/vitrines", label: "Vitrines", icon: LayoutList, table: "showcases" as const },
    { to: "/admin/paginas", label: "Páginas", icon: FileText, table: "pages" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Bem-vinda ao painel</h1>
        <p className="text-sm text-muted-foreground">Gerencie tudo que aparece na loja em um só lugar.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <DashCard key={it.to} {...it} />
        ))}
      </div>
    </div>
  );
}

function DashCard({ to, label, icon: Icon, table }: { to: string; label: string; icon: typeof Package; table: "products" | "categories" | "banners" | "showcases" | "pages" }) {
  const { data } = useCount(table);
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-3xl">{data ?? "—"}</div>
      </div>
      <Icon className="h-8 w-8 text-primary" />
    </Link>
  );
}
