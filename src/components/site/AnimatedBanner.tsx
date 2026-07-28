import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles as SparklesIcon, Heart, Star, Gift } from "lucide-react";

export function AnimatedBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 shadow-glow">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient-shift bg-candy bg-[length:300%_300%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30" />

        {/* Blurred floating orbs */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/40 blur-3xl animate-float" />
        <div
          className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-primary/30 blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="pointer-events-none absolute left-1/3 top-1/2 h-40 w-40 rounded-full bg-secondary/40 blur-2xl animate-float"
          style={{ animationDelay: "0.8s" }}
        />

        {/* Floating icons */}
        <Heart
          className="pointer-events-none absolute left-[8%] top-[18%] h-6 w-6 fill-white/90 text-white/90 animate-float drop-shadow"
          style={{ animationDelay: "0.2s" }}
        />
        <Star
          className="pointer-events-none absolute right-[12%] top-[22%] h-5 w-5 fill-white/90 text-white/90 animate-twinkle drop-shadow"
        />
        <Gift
          className="pointer-events-none absolute left-[14%] bottom-[18%] h-6 w-6 text-white/95 animate-float drop-shadow"
          style={{ animationDelay: "1.1s" }}
        />
        <SparklesIcon
          className="pointer-events-none absolute right-[8%] bottom-[24%] h-6 w-6 text-white/95 animate-twinkle drop-shadow"
          style={{ animationDelay: "0.6s" }}
        />

        {/* Sparkle emojis */}
        <span className="pointer-events-none absolute left-[45%] top-[12%] text-xl animate-twinkle" style={{ animationDelay: "0.3s" }}>✨</span>
        <span className="pointer-events-none absolute right-[30%] bottom-[14%] text-lg animate-twinkle" style={{ animationDelay: "0.9s" }}>💫</span>
        <span className="pointer-events-none absolute left-[28%] top-[70%] text-lg animate-twinkle" style={{ animationDelay: "1.4s" }}>⭐</span>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-14 text-center md:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-soft backdrop-blur animate-fade-in">
            <SparklesIcon className="h-3.5 w-3.5 animate-twinkle" /> Novo & Encantado
          </span>

          <h2 className="max-w-2xl font-display text-3xl leading-tight text-white drop-shadow-md md:text-5xl">
            Convites <span className="font-script text-4xl md:text-6xl">mágicos</span> que
            <br className="hidden md:block" /> transformam a sua festa
          </h2>

          <p className="max-w-md text-sm text-white/90 drop-shadow md:text-base">
            Personalize em minutos, receba em até 24h e encante todos os convidados.
          </p>

          <Link
            to="/categorias"
            className="group mt-2 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-glow transition hover:scale-[1.04] hover:shadow-soft"
          >
            Ver todos os convites
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Shimmer bar */}
          <div className="mt-6 h-[3px] w-32 overflow-hidden rounded-full bg-white/40">
            <div className="h-full w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
