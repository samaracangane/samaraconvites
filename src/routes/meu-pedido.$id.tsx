import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PixPayment } from "@/components/site/PixPayment";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getPublicOrder, startOrderCheckout, syncOrderPayment } from "@/lib/orders.functions";
import { CheckCircle2, Clock, CreditCard, Download, QrCode, Sparkles, XCircle } from "lucide-react";

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
  { key: "created", label: "Pedido realizado", icon: CheckCircle2 },
  { key: "pending", label: "Aguardando pagamento", icon: Clock },
  { key: "paid", label: "Pagamento confirmado", icon: CheckCircle2 },
  { key: "production", label: "Convite em produção", icon: Sparkles },
  { key: "delivered", label: "Convite pronto e entregue", icon: Download },
] as const;

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  in_analysis: "Pagamento em análise",
  paid: "Pago",
  declined: "Pagamento recusado",
  overdue: "Pagamento vencido",
  canceled: "Pagamento cancelado",
  refunded: "Estornado",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de crédito",
};

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function stepIndex(status: string) {
  if (status === "delivered") return 4;
  if (status === "paid") return 3;
  return 1;
}

function MeuPedido() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-order", id],
    queryFn: () => getPublicOrder({ data: { orderId: id } }),
    refetchInterval: 15000,
  });

  const startCheckoutFn = useServerFn(startOrderCheckout);
  const syncPaymentFn = useServerFn(syncOrderPayment);
  const [creating, setCreating] = useState<"PIX" | "CREDIT_CARD" | null>(null);
  const syncing = useRef(false);

  const total = data ? Number(data.price) * Number(data.quantity ?? 1) : 0;

  // Rede de segurança: enquanto estiver pendente, reconsulta o Asaas.
  useEffect(() => {
    if (!data || data.status !== "pending" || !data.payment_method) return;
    const check = async () => {
      if (syncing.current) return;
      syncing.current = true;
      try {
        await syncPaymentFn({ data: { orderId: id } });
        await refetch();
      } catch {
        /* silencioso */
      } finally {
        syncing.current = false;
      }
    };
    const t = setInterval(check, 20000);
    return () => clearInterval(t);
  }, [data, id, syncPaymentFn, refetch]);

  async function choose(method: "PIX" | "CREDIT_CARD") {
    setCreating(method);
    try {
      const res = await startCheckoutFn({ data: { orderId: id, method } });
      await refetch();
      if (method === "CREDIT_CARD" && res.paymentUrl) {
        window.open(res.paymentUrl, "_blank", "noopener");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível gerar a cobrança");
    } finally {
      setCreating(null);
    }
  }

  const current = data ? stepIndex(data.status) : 0;

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
            {/* Resumo do pedido com a imagem em destaque */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              {data.product_image_url && (
                <img
                  src={data.product_image_url}
                  alt={data.product_title}
                  className="max-h-[420px] w-full bg-muted object-contain"
                />
              )}
              <div className="p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">
                  Pedido nº {data.id.slice(0, 8).toUpperCase()}
                </div>
                <h2 className="mt-1 font-display text-2xl">{data.product_title}</h2>
                <div className="mt-1 text-sm text-muted-foreground">
                  Para {data.child_name} · pedido em{" "}
                  {new Date(data.created_at).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>

                <dl className="mt-4 space-y-1.5 border-t border-border/60 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Preço</dt>
                    <dd className="font-semibold">{formatBRL(Number(data.price))}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Quantidade</dt>
                    <dd className="font-semibold">{data.quantity ?? 1}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Forma de pagamento</dt>
                    <dd className="font-semibold">
                      {data.payment_method
                        ? (PAYMENT_METHOD_LABEL[data.payment_method] ?? data.payment_method)
                        : "A escolher"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Status do pagamento</dt>
                    <dd className="font-semibold">
                      {PAYMENT_STATUS_LABEL[data.payment_status ?? "pending"] ?? "Aguardando pagamento"}
                    </dd>
                  </div>
                  {data.paid_at && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Pago em</dt>
                      <dd className="font-semibold">
                        {new Date(data.paid_at).toLocaleString("pt-BR")}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between border-t border-border/60 pt-2">
                    <dt className="font-semibold">
                      {data.status === "pending" ? "Valor a pagar" : "Valor pago"}
                    </dt>
                    <dd className="text-xl font-bold text-primary">{formatBRL(total)}</dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-2xl bg-muted/60 px-4 py-3 text-center text-sm font-semibold">
                  {data.status === "pending" && "Aguardando confirmação do pagamento"}
                  {data.status === "paid" && "Pagamento confirmado — convite em produção"}
                  {data.status === "delivered" && "Convite entregue 💗"}
                  {data.status === "canceled" && "Pedido cancelado ou reembolsado"}
                </div>
              </div>
            </div>

            {data.status === "canceled" ? (
              <div className="flex items-center gap-2 rounded-2xl bg-muted p-4 text-sm">
                <XCircle className="h-4 w-4 text-destructive" /> Pedido cancelado ou reembolsado.
              </div>
            ) : (
              <ol className="space-y-4 rounded-3xl border border-border bg-card p-6">
                {STEPS.map((step, i) => {
                  const done = i <= current;
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
                {data.payment_updated_at && (
                  <li className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    Última atualização do pagamento:{" "}
                    {new Date(data.payment_updated_at).toLocaleString("pt-BR")}
                  </li>
                )}
              </ol>
            )}

            {data.status === "pending" && (
              <div className="space-y-4">
                {/* Escolha da forma de pagamento */}
                <div className="rounded-3xl border border-border bg-card p-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary">
                    Como você quer pagar?
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => choose("PIX")}
                      disabled={creating !== null}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition disabled:opacity-60 ${
                        data.payment_method === "PIX"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      <QrCode className="h-4 w-4" />
                      {creating === "PIX" ? "Gerando PIX…" : "PIX"}
                    </button>
                    <button
                      type="button"
                      onClick={() => choose("CREDIT_CARD")}
                      disabled={creating !== null}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition disabled:opacity-60 ${
                        data.payment_method === "CREDIT_CARD"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      {creating === "CREDIT_CARD" ? "Abrindo checkout…" : "Cartão de crédito"}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    O pagamento é processado com segurança pelo Asaas. Nenhum dado do cartão passa
                    ou fica guardado na nossa loja.
                  </p>
                </div>

                {data.payment_method === "PIX" && data.pix_payload && (
                  <PixPayment
                    payload={data.pix_payload}
                    amount={total}
                    qrImage={data.pix_qr_image}
                    expiresAt={data.pix_expires_at}
                  />
                )}

                {data.payment_method === "CREDIT_CARD" && data.payment_url && (
                  <a
                    href={data.payment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
                  >
                    <CreditCard className="h-4 w-4" /> Pagar agora
                  </a>
                )}
              </div>
            )}

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
