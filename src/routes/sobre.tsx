import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Heart, Sparkles, Clock } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Samara Encanto Convites" },
      { name: "description", content: "Conheça a Samara Encanto Convites: convites digitais infantis feitos com carinho, delicadeza e magia." },
      { property: "og:title", content: "Sobre — Samara Encanto Convites" },
      { property: "og:description", content: "Convites digitais infantis feitos com muito amor." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Nossa história</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Feito com muito amor 💗</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          A Samara Encanto Convites nasceu do desejo de transformar cada convite em um pequeno momento de magia.
          Cada arte é pensada com carinho, para que a festa das crianças seja inesquecível desde o primeiro convite recebido.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { i: <Heart className="h-5 w-5" />, t: "Com carinho", d: "Cada detalhe é feito pensando na sua família." },
            { i: <Sparkles className="h-5 w-5" />, t: "Encanto", d: "Design delicado, moderno e cheio de magia." },
            { i: <Clock className="h-5 w-5" />, t: "Rápido", d: "Entrega em até 24h após o pagamento." },
          ].map((v) => (
            <div key={v.t} className="rounded-3xl border border-border/60 bg-card p-6 text-left shadow-card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{v.i}</div>
              <h3 className="font-display text-lg">{v.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
