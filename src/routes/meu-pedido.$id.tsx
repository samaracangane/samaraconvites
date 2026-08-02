import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getPublicOrder } from "@/lib/orders.functions";
import { CheckCircle2, Clock, Download, Sparkles, XCircle } from "lucide-react";

export const Route = createFileRoute("/meu-pedido/$id")({
  head: () => ({
    meta: [
      { title: "Acompanhe seu convite — Samara Encanto Convites" },
      {
        name: "description",
        content:
          "Acompanhe o status do seu convite digital personalizado e baixe o arquivo quando estiver pronto.",
      },
      { property: "og:title", content: "Acompanhe seu convite — Samara Encanto Convites" },
      {
        property: "og:description",
        content: "Veja o andamento do seu convite personalizado e faça o download quando ficar pronto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MeuPedido,
});

const STEPS = [
  { key: "pending", label: "Pedido recebido", icon: Clock },
  { key: "paid", label: "Pagamento confirmado", icon: CheckCircle2 },
  { key: "delivered", label: "Convite entregue", icon: Sparkles },
] as const;

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function MeuPedido() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-order", id],
    queryFn: () => getPublicOrder({ data: { orderId: id } }),
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl">Acompanhe seu convite</h1>

        {isLoading && <p className="mt-6 text-sm text-muted-foreground">Carregando…</p>}

        {(isError || (!isLoading && !data)) && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Não encontramos esse pedido. Confira o link recebido ou fale com a gente pelo WhatsApp.
          </div>
        )}

        {data && (
          <div className="mt-6 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">
                {data.product_title}
              </div>
              <div className="mt-1 font-display text-2xl">{data.child_name}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatBRL(Number(data.price))} · pedido em{" "}
                {new Date(data.created_at).toLocaleDateString("pt-BR")}
              </div>

              {data.status === "canceled" ? (
                <div className="mt-5 flex items-center gap-2 rounded-2xl bg-muted p-4 text-sm">
                  <XCircle className="h-4 w-4 text-destructive" /> Pedido cancelado ou reembolsado.
                </div>
              ) : (
                <ol className="mt-6 space-y-4">
                  {STEPS.map((step) => {
                    const order = ["pending", "paid", "delivered"];
                    const done = order.indexOf(data.status) >= order.indexOf(step.key);
                    const Icon = step.icon;
                    return (
                      <li key={step.key} className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            done ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className={done ? "font-semibold" : "text-muted-foreground"}>
                          {step.label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            {data.delivered_media_url && (
              <a
                href={data.delivered_media_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
              >
                <Download className="h-4 w-4" /> Baixar meu convite
              </a>
            )}

            {(data.party_date || data.party_time || data.party_location) && (
              <div className="rounded-3xl border border-border bg-card p-6 text-sm">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                  Dados da festa
                </div>
                {data.party_date && (
                  <div>Data: {new Date(data.party_date).toLocaleDateString("pt-BR")}</div>
                )}
                {data.party_time && <div>Horário: {data.party_time}</div>}
                {data.party_location && <div>Local: {data.party_location}</div>}
              </div>
            )}
          </div>
        )}

        <Link to="/" className="mt-8 inline-block text-sm text-primary hover:underline">
          ← Voltar para a loja
        </Link>
      </main>
      <Footer />
    </div>
  );
}
