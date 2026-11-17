import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, QrCode, Plug } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamentos Wiapy — Painel Samara Encanto" }, { name: "robots", content: "noindex" }] }),
  component: PaymentsAdmin,
});

function PaymentsAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-primary">Pagamentos Wiapy</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurações e situação das formas de pagamento da loja.</p>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-2"><Plug className="h-5 w-5 text-primary" /><h2 className="font-semibold">Wiapy</h2></div>
        <p className="text-sm text-muted-foreground">
          Status: <span className="font-medium text-foreground">não conectada</span>. Para ativar, é preciso a chave de acesso (API) da sua conta Wiapy.
        </p>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="font-semibold mb-3">Checkout ativo da loja (Asaas)</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><QrCode className="h-4 w-4 text-primary" /> PIX — ativo</li>
          <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Cartão de crédito — ativo</li>
        </ul>
        <Link to="/admin/vendas" className="mt-4 inline-block text-sm text-primary underline">Ver vendas confirmadas</Link>
      </section>
    </div>
  );
}
