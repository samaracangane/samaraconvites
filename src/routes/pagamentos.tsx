import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/pagamentos")({
  head: () => ({
    meta: [
      { title: "Formas de pagamento — Samara Encanto Convites" },
      { name: "description", content: "Pague seu convite digital por PIX ou cartão de crédito com segurança, processado pelo Asaas." },
      { property: "og:title", content: "Formas de pagamento — Samara Encanto Convites" },
      { property: "og:description", content: "PIX ou cartão de crédito, com confirmação automática por e-mail." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagamentos,
});

function Pagamentos() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl md:text-4xl text-primary mb-6">Formas de pagamento</h1>
        <div className="space-y-4 text-foreground/80">
          <div className="rounded-2xl bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl text-foreground mb-2">PIX</h2>
            <p>Mostramos o QR Code e o código copia e cola na hora. A confirmação é automática.</p>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl text-foreground mb-2">Cartão de crédito</h2>
            <p>Você é levado ao checkout seguro do Asaas para concluir o pagamento.</p>
          </div>
          <p>Depois do pagamento você recebe a confirmação por e-mail e pode acompanhar seu pedido.</p>
          <Link to="/" className="inline-block text-primary underline">Ver convites</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
