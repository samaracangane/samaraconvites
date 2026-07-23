import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/use-current-user";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Tags,
  Image as ImageIcon,
  FileText,
  LayoutList,
  LogOut,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Início", icon: LayoutDashboard, exact: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: Tags },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/vitrines", label: "Vitrines", icon: LayoutList },
  { to: "/admin/paginas", label: "Páginas", icon: FileText },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading } = useCurrentUser();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-display text-2xl">Acesso restrito</h1>
        <p className="text-sm text-muted-foreground">
          Este painel é exclusivo para administradores. Sua conta ({user?.email}) não possui essa
          permissão.
        </p>
        <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}>
          Sair
        </Button>
      </div>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[220px_1fr] md:p-8">
        <aside className="rounded-2xl border border-border/60 bg-card p-3 shadow-card md:sticky md:top-6 md:h-fit">
          <div className="mb-2 px-2 py-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Painel</div>
            <div className="font-display text-lg leading-tight">Samara Encanto</div>
            <div className="mt-1 truncate text-[11px] text-muted-foreground">{user?.email}</div>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
