import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CalendarDays, Search, ShoppingBag, Sparkles, WalletCards } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/admin/vendas")({
  head: () => ({
    meta: [
      { title: "Vendas confirmadas — Samara Encanto" },
      { name: "description", content: "Compras confirmadas da Samara Encanto Convites." },
      { property: "og:title", content: "Vendas confirmadas — Samara Encanto" },
      { property: "og:description", content: "Compras confirmadas da Samara Encanto Convites." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfirmedSalesPage,
});

type ConfirmedSale = {
  id: string;
  product_title: string;
  product_image_url: string | null;
  customer_name: string;
  child_name: string;
  customer_phone: string;
  price: number;
  quantity: number | null;
  amount_paid: number | null;
  payment_method: string | null;
  status: "paid" | "delivered";
  paid_at: string | null;
  created_at: string;
};

function useConfirmedSales() {
  return useQuery({
    queryKey: ["orders", "confirmed-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, product_title, product_image_url, customer_name, child_name, customer_phone, price, quantity, amount_paid, payment_method, status, paid_at, created_at",
        )
        .in("status", ["paid", "delivered"])
        .order("paid_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as ConfirmedSale[];
    },
  });
}

function saleValue(sale: ConfirmedSale) {
  return Number(sale.amount_paid ?? Number(sale.price) * Number(sale.quantity ?? 1));
}

function ConfirmedSalesPage() {
  const { data: sales = [], isLoading, isError } = useConfirmedSales();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return sales;
    return sales.filter((sale) =>
      [sale.customer_name, sale.child_name, sale.product_title]
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(query)),
    );
  }, [sales, search]);

  const total = useMemo(() => sales.reduce((sum, sale) => sum + saleValue(sale), 0), [sales]);
  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return sales.filter((sale) => new Date(sale.paid_at ?? sale.created_at) >= start).length;
  }, [sales]);

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl bg-hero px-5 py-7 shadow-soft sm:px-8">
        <Sparkles className="absolute right-6 top-5 h-8 w-8 text-primary/35" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Samara Encanto Convites</p>
          <h1 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">Vendas confirmadas</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Acompanhe todas as compras pagas e prontas para produção em um só lugar.
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumo das vendas">
        <Summary icon={WalletCards} label="Total confirmado" value={formatBRL(total)} />
        <Summary icon={ShoppingBag} label="Compras confirmadas" value={String(sales.length)} />
        <Summary icon={CalendarDays} label="Vendas hoje" value={String(today)} />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Histórico</p>
            <h2 className="font-display text-2xl">Compras recebidas</h2>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Buscar venda</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cliente ou produto"
              className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Carregando vendas...</div>
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/30 bg-card p-6 text-center text-sm text-destructive">
            Não foi possível carregar as vendas agora.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-card p-10 text-center">
            <BadgeCheck className="mx-auto h-9 w-9 text-primary/50" />
            <p className="mt-3 font-display text-lg">Nenhuma venda encontrada</p>
            <p className="mt-1 text-sm text-muted-foreground">As compras confirmadas aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((sale) => (
              <article key={sale.id} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
                <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {sale.product_image_url ? (
                    <img src={sale.product_image_url} alt={sale.product_title} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-primary/50"><ShoppingBag className="h-6 w-6" /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg">{sale.customer_name}</h3>
                      <p className="truncate text-sm text-muted-foreground">{sale.product_title}</p>
                    </div>
                    <span className="shrink-0 font-display text-lg text-primary">{formatBRL(saleValue(sale))}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>Para {sale.child_name}</span>
                    <span>{sale.payment_method === "CREDIT_CARD" ? "Cartão" : "PIX"}</span>
                    <span>{new Date(sale.paid_at ?? sale.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-foreground/75">
                      <BadgeCheck className="h-3.5 w-3.5" /> {sale.status === "delivered" ? "Entregue" : "Pagamento confirmado"}
                    </span>
                    <Link to="/admin/pedidos" className="text-xs font-bold text-primary hover:underline">Ver pedido</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof WalletCards; label: string; value: string }) {
  return (
    <div className="flex min-h-28 items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-card">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 truncate font-display text-2xl text-foreground">{value}</p>
      </div>
    </div>
  );
}