import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles as SparklesIcon } from "lucide-react";
import heroInvite from "@/assets/hero-invite.png";
import { Sparkles } from "./Sparkles";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <Sparkles />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:pb-24 md:pt-16">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-soft backdrop-blur">
            <SparklesIcon className="h-3.5 w-3.5" /> Entrega em até 24h
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
            Convites que <span className="text-gradient">encantam</span> em cada detalhe
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground/70 md:text-lg">
            Convites digitais personalizados para tornar cada festa infantil única.
            Escolha o seu, personalize em minutos e receba pronto para compartilhar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/categorias"
              className="inline-flex items-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:scale-[1.03]"
            >
              Ver convites <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#destaques"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-6 py-3 text-sm font-bold text-primary backdrop-blur transition hover:bg-white"
            >
              Ver destaques
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5 text-xs font-semibold text-foreground/60">
            <span className="flex items-center gap-1.5">💖 +2.500 famílias felizes</span>
            <span className="flex items-center gap-1.5">⭐ 4.9 de avaliação</span>
            <span className="flex items-center gap-1.5">🎁 Pagamento seguro</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-candy opacity-40 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 shadow-glow backdrop-blur">
            <img
              src={heroInvite}
              alt="Convite digital personalizado — exemplo encantador de festa infantil"
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-white/90 px-4 py-3 shadow-glow backdrop-blur md:block">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mais amado</div>
            <div className="font-display text-sm">Princesa Encantada 👑</div>
          </div>
          <div className="absolute -top-3 -right-3 animate-float rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-primary shadow-soft backdrop-blur">
            ✨ Novidade
          </div>
        </div>
      </div>
    </section>
  );
}
