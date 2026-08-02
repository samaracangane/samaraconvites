import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/pedido-confirmado")({
  head: () => ({
    meta: [
      { title: "Pagamento confirmado — Samara Encanto Convites" },
      {
        name: "description",
        content:
          "Seu pagamento foi recebido e seu convite digital personalizado já entrou na fila de produção.",
      },
      { property: "og:title", content: "Pagamento confirmado — Samara Encanto Convites" },
      {
        property: "og:description",
        content: "Recebemos seu pagamento. Seu convite personalizado será entregue em breve.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PedidoConfirmado,
});

function PedidoConfirmado() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl">Pagamento confirmado! 💗</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Recebemos seu pagamento e os dados do convite. Você receberá a confirmação por e-mail e o
          convite será entregue dentro do prazo informado.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
        >
          Voltar para a loja
        </Link>
      </main>
      <Footer />
    </div>
  );
}
