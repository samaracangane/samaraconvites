import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Instagram, MessageCircle, Mail } from "lucide-react";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Samara Encanto Convites" },
      { name: "description", content: "Fale com a Samara Encanto Convites por WhatsApp, e-mail ou Instagram." },
      { property: "og:title", content: "Contato — Samara Encanto Convites" },
      { property: "og:description", content: "Fale com a gente por WhatsApp, e-mail ou Instagram." },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Vamos conversar</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Estamos aqui pra você 💌</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Dúvidas, pedidos especiais ou parcerias? Escolha o canal que preferir.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { i: <MessageCircle className="h-5 w-5" />, t: "WhatsApp", d: "Resposta rápida", h: "https://wa.me/5500000000000" },
            { i: <Instagram className="h-5 w-5" />, t: "Instagram", d: "@samaraencanto", h: "#" },
            { i: <Mail className="h-5 w-5" />, t: "E-mail", d: "ola@samaraencanto.com", h: "mailto:ola@samaraencanto.com" },
          ].map((c) => (
            <a key={c.t} href={c.h} className="rounded-3xl border border-border/60 bg-card p-6 text-left shadow-card transition hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{c.i}</div>
              <h3 className="font-display text-lg">{c.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </a>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
