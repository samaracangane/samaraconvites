import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Instagram, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { BUSINESS, BUSINESS_ADDRESS } from "@/lib/business";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Samara Encanto Convites" },
      {
        name: "description",
        content:
          "Fale com a Samara Encanto Convites por WhatsApp (17) 99672-2089, e-mail ou Instagram. Atendimento de segunda a sexta, das 9h às 18h.",
      },
      { property: "og:title", content: "Contato — Samara Encanto Convites" },
      { property: "og:description", content: "WhatsApp, e-mail e Instagram para suporte e dúvidas sobre convites digitais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contato,
});

function Contato() {
  const channels = [
    {
      i: <MessageCircle className="h-5 w-5" />,
      t: "WhatsApp",
      d: BUSINESS.whatsappDisplay,
      h: BUSINESS.whatsappUrl,
    },
    {
      i: <Mail className="h-5 w-5" />,
      t: "E-mail",
      d: BUSINESS.email,
      h: `mailto:${BUSINESS.email}`,
    },
    {
      i: <Instagram className="h-5 w-5" />,
      t: "Instagram",
      d: BUSINESS.instagramHandle,
      h: BUSINESS.instagramUrl,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Vamos conversar</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Estamos aqui pra você 💌</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Dúvidas sobre um convite, pedidos especiais, suporte pós-compra ou reembolso? Fale com a gente
          pelo canal que preferir — respondemos em até 24 horas úteis.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {channels.map((c) => (
            <a
              key={c.t}
              href={c.h}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-3xl border border-border/60 bg-card p-6 text-left shadow-card transition hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{c.i}</div>
              <h3 className="font-display text-lg">{c.t}</h3>
              <p className="mt-1 break-words text-sm text-muted-foreground">{c.d}</p>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-border/60 bg-card p-6 text-left shadow-card">
          <h2 className="font-display text-xl">Dados da loja</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">{BUSINESS.brand}</strong> — convites digitais
              infantis personalizados
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> {BUSINESS_ADDRESS}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> {BUSINESS.supportHours}
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            O pagamento é feito por PIX ou cartão de crédito via Asaas. O
            atendimento, os ajustes e os pedidos de reembolso são feitos diretamente conosco pelos
            canais acima.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
