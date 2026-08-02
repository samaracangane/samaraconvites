import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, X, ExternalLink, Trash2, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/pedidos")({
  component: PedidosPage,
});

type OrderStatus = "pending" | "paid" | "delivered" | "canceled";

type Order = {
  id: string;
  product_id: string | null;
  product_title: string;
  product_slug: string;
  price: number;
  status: OrderStatus;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  child_name: string;
  child_age: string | null;
  party_date: string | null;
  party_time: string | null;
  party_location: string | null;
  party_address: string | null;
  party_map_url: string | null;
  message: string | null;
  clothing_size: string | null;
  shoe_size: string | null;
  gift_type: string | null;
  notes: string | null;
  photo_url: string | null;
  music_url: string | null;
  delivered_media_url: string | null;
  delivered_at: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  delivered: "Entregue",
  canceled: "Cancelado",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  canceled: "bg-red-100 text-red-800",
};

const FILTERS: Array<{ key: OrderStatus | "all"; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendentes" },
  { key: "paid", label: "Pagos" },
  { key: "delivered", label: "Entregues" },
  { key: "canceled", label: "Cancelados" },
];

function useOrders() {
  return useQuery({
    queryKey: ["orders", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });
}

function PedidosPage() {
  const { data: orders = [], isLoading } = useOrders();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length, pending: 0, paid: 0, delivered: 0, canceled: 0 };
    for (const o of orders) c[o.status]++;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.customer_name.toLowerCase().includes(q) ||
        o.child_name.toLowerCase().includes(q) ||
        o.product_title.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        (o.customer_email ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, filter, search]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, delivered_media_url }: { id: string; status: OrderStatus; delivered_media_url?: string | null }) => {
      const patch: {
        status: OrderStatus;
        delivered_at?: string | null;
        delivered_media_url?: string | null;
      } = { status };
      if (status === "delivered") {
        patch.delivered_at = new Date().toISOString();
        if (delivered_media_url !== undefined) patch.delivered_media_url = delivered_media_url;
      }
      const { error } = await supabase.from("orders").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pedido atualizado");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao atualizar"),
  });

  const removeOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pedido removido");
      qc.invalidateQueries({ queryKey: ["orders"] });
      setOpenId(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover"),
  });

  const openOrder = orders.find((o) => o.id === openId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Pedidos</h1>
        <p className="text-sm text-muted-foreground">Gerencie personalizações recebidas e marque como entregue.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/70 hover:border-primary/50"
            }`}
          >
            {f.label} <span className="ml-1 opacity-70">({counts[f.key] ?? 0})</span>
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, produto..."
            className="w-full rounded-full border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum pedido encontrado.</div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => setOpenId(o.id)}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{o.child_name}</span>
                    <span className="text-xs text-muted-foreground">— {o.customer_name}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {o.product_title} · {o.customer_phone}
                  </div>
                </div>
                <div className="hidden text-right text-xs text-muted-foreground sm:block">
                  {new Date(o.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{formatBRL(Number(o.price))}</div>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {openOrder && (
        <OrderDetail
          order={openOrder}
          onClose={() => setOpenId(null)}
          onUpdate={(patch) => updateStatus.mutate({ id: openOrder.id, ...patch })}
          onDelete={() => {
            if (confirm("Remover este pedido definitivamente?")) removeOrder.mutate(openOrder.id);
          }}
          saving={updateStatus.isPending}
        />
      )}
    </div>
  );
}

function OrderDetail({
  order,
  onClose,
  onUpdate,
  onDelete,
  saving,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (patch: { status: OrderStatus; delivered_media_url?: string | null }) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const [deliveredUrl, setDeliveredUrl] = useState(order.delivered_media_url ?? "");
  const digits = order.customer_phone.replace(/\D/g, "");
  const intlPhone = digits.length <= 11 ? `55${digits}` : digits;
  const waLink = `https://wa.me/${intlPhone}`;
  const trackUrl =
    typeof window !== "undefined" ? `${window.location.origin}/meu-pedido/${order.id}` : "";
  const waMessage =
    order.status === "delivered"
      ? `Oi, ${order.customer_name}! 💗 O convite "${order.product_title}" do(a) ${order.child_name} está pronto!${order.delivered_media_url ? ` Baixe aqui: ${order.delivered_media_url}` : ""}`
      : order.status === "paid"
        ? `Oi, ${order.customer_name}! 💗 Recebi seu pagamento do convite "${order.product_title}" do(a) ${order.child_name}. Já comecei a produção! Acompanhe aqui: ${trackUrl}`
        : `Oi, ${order.customer_name}! 💗 Recebi seu pedido do convite "${order.product_title}" do(a) ${order.child_name}. Acompanhe aqui: ${trackUrl}`;
  const waSendLink = `${waLink}?text=${encodeURIComponent(waMessage)}`;


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">Pedido</div>
          <h2 className="font-display text-2xl">{order.child_name}</h2>
          <div className="text-sm text-muted-foreground">{order.product_title}</div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLE[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <span className="text-sm font-bold text-primary">{formatBRL(Number(order.price))}</span>
          <span className="text-xs text-muted-foreground">
            Recebido em {new Date(order.created_at).toLocaleString("pt-BR")}
          </span>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <a
            href={waSendLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            Falar no WhatsApp <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(trackUrl)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Copiar link de acompanhamento
          </button>
        </div>


        <Section title="Cliente">
          <Row label="Nome" value={order.customer_name} />
          <Row label="Celular" value={<a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{order.customer_phone} <ExternalLink className="h-3 w-3" /></a>} />
          {order.customer_email && <Row label="E-mail" value={order.customer_email} />}
        </Section>

        <Section title="Festa">
          <Row label="Aniversariante" value={order.child_name} />
          {order.child_age && <Row label="Idade" value={order.child_age} />}
          {order.party_date && <Row label="Data" value={new Date(order.party_date).toLocaleDateString("pt-BR")} />}
          {order.party_time && <Row label="Horário" value={order.party_time} />}
          {order.party_location && <Row label="Local" value={order.party_location} />}
          {order.party_address && <Row label="Endereço" value={order.party_address} />}
          {order.party_map_url && (
            <Row label="Mapa" value={<a href={order.party_map_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Abrir <ExternalLink className="h-3 w-3" /></a>} />
          )}
        </Section>

        {(order.message || order.clothing_size || order.shoe_size || order.gift_type || order.notes) && (
          <Section title="Mensagem e detalhes">
            {order.message && <Row label="Mensagem" value={<span className="whitespace-pre-wrap">{order.message}</span>} />}
            {order.clothing_size && <Row label="Roupa" value={order.clothing_size} />}
            {order.shoe_size && <Row label="Calçado" value={order.shoe_size} />}
            {order.gift_type && <Row label="Presentes" value={order.gift_type} />}
            {order.notes && <Row label="Observações" value={<span className="whitespace-pre-wrap">{order.notes}</span>} />}
          </Section>
        )}

        {(order.photo_url || order.music_url) && (
          <Section title="Arquivos enviados">
            {order.photo_url && <Row label="Foto" value={<a href={order.photo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Abrir <ExternalLink className="h-3 w-3" /></a>} />}
            {order.music_url && <Row label="Música" value={<a href={order.music_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">Abrir <ExternalLink className="h-3 w-3" /></a>} />}
          </Section>
        )}

        <Section title="Entrega">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">Link da mídia final</span>
            <input
              type="url"
              value={deliveredUrl}
              onChange={(e) => setDeliveredUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <span className="text-[11px] text-muted-foreground">Cole o link do convite pronto para o cliente.</span>
          </label>
          {order.delivered_at && (
            <div className="mt-2 text-xs text-muted-foreground">
              Entregue em {new Date(order.delivered_at).toLocaleString("pt-BR")}
            </div>
          )}
        </Section>

        <div className="mt-6 flex flex-wrap gap-2">
          {order.status !== "paid" && order.status !== "delivered" && (
            <Button variant="outline" onClick={() => onUpdate({ status: "paid" })} disabled={saving}>
              Marcar como pago
            </Button>
          )}
          {order.status !== "delivered" && (
            <Button
              onClick={() => onUpdate({ status: "delivered", delivered_media_url: deliveredUrl || null })}
              disabled={saving}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" /> Marcar como entregue
            </Button>
          )}
          {order.status === "delivered" && deliveredUrl !== (order.delivered_media_url ?? "") && (
            <Button onClick={() => onUpdate({ status: "delivered", delivered_media_url: deliveredUrl || null })} disabled={saving}>
              Atualizar link
            </Button>
          )}
          {order.status !== "canceled" && order.status !== "delivered" && (
            <Button variant="outline" onClick={() => onUpdate({ status: "canceled" })} disabled={saving}>
              Cancelar
            </Button>
          )}
          {order.status === "canceled" && (
            <Button variant="outline" onClick={() => onUpdate({ status: "pending" })} disabled={saving}>
              Reabrir
            </Button>
          )}
          <Button variant="ghost" onClick={onDelete} className="ml-auto gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" /> Remover
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-2xl border border-border/60 bg-muted/20 p-4">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{title}</div>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="min-w-0 break-words text-foreground">{value}</div>
    </div>
  );
}
