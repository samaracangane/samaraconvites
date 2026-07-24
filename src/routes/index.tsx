import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionTitle } from "@/components/site/SectionTitle";
import { useStoreCatalog } from "@/lib/store-queries";
import { ArrowRight, Star, Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Samara Encanto Convites — Convites digitais infantis" },
      {
        name: "description",
        content:
          "Loja de convites digitais personalizados para festas infantis. Imagem, vídeo e entrega em até 24h.",
      },
      { property: "og:title", content: "Samara Encanto Convites" },
      { property: "og:description", content: "Convites digitais infantis com muito encanto. Personalize e receba em até 24h." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useStoreCatalog();
  const products = data?.products ?? [];
  const featured = products.filter((p) => p.featured);
  const bestsellers = products.filter((p) => p.bestseller);
  const news = products.filter((p) => p.isNew);
  const promos = products.filter((p) => p.onSale);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      {/* Categorias */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle
          eyebrow="Navegue por tema"
          title="Categorias encantadoras"
          action={
            <Link to="/categorias" className="hidden items-center gap-1 text-sm font-bold text-primary hover:underline md:inline-flex">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <CategoryGrid limit={12} />
      </section>

      {/* Destaques */}
      {featured.length > 0 && (
        <section id="destaques" className="mx-auto max-w-7xl px-4 py-8">
          <SectionTitle eyebrow="Feitos com amor" title="Convites em destaque" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}

      {/* Banner de promo */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="relative overflow-hidden rounded-3xl bg-primary-gradient p-8 text-primary-foreground shadow-glow md:p-12">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> Oferta especial
              </span>
              <h3 className="mt-3 font-display text-2xl md:text-4xl">
                Convites em vídeo com 30% OFF
              </h3>
              <p className="mt-2 max-w-md text-sm opacity-90">
                Deixe sua festa ainda mais mágica com nossos convites animados. Por tempo limitado.
              </p>
            </div>
            <Link
              to="/categorias"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-soft transition hover:scale-[1.03]"
            >
              Aproveitar agora <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {bestsellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <SectionTitle eyebrow="Amados por todos" title="Mais vendidos" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {bestsellers.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <SectionTitle eyebrow="Recém-chegados" title="Novidades da vitrine" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {news.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}

      {/* Promoções */}
      {promos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <SectionTitle eyebrow="Aproveite" title="Promoções da semana" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {promos.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Simples e rápido" title="Como funciona" />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { n: "1", t: "Escolha o convite", d: "Encontre o convite ideal navegando por categorias e filtros.", e: "🎨" },
            { n: "2", t: "Personalize", d: "Preencha os dados da festa: tema, data, local, mensagem e mais.", e: "✏️" },
            { n: "3", t: "Receba em 24h", d: "Após o pagamento, seu convite chega pronto no seu WhatsApp.", e: "💌" },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">{s.e}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary">Passo {s.n}</div>
              <h3 className="mt-1 font-display text-xl">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Avaliações */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle eyebrow="O que dizem" title="Mamães encantadas" />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { n: "Juliana", c: "Meninos", t: "O convite ficou lindo e chegou super rápido! Todo mundo elogiou.", },
              { n: "Camila", c: "Princesas", t: "Amei a delicadeza! A festa da minha filha ficou perfeita.", },
              { n: "Renata", c: "Chá de bebê", t: "Atendimento maravilhoso e arte impecável. Recomendo demais 💗", },
            ].map((r) => (
              <div key={r.n} className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
                <div className="mb-2 flex text-primary">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">"{r.t}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {r.n[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{r.n}</div>
                    <div className="text-xs text-muted-foreground">Tema: {r.c}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-hero p-10 text-center shadow-soft">
          <Heart className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h3 className="font-display text-3xl md:text-4xl">Vamos criar algo mágico juntos?</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-foreground/70">
            Escolha seu convite favorito e comece a personalizar em minutos.
          </p>
          <Link
            to="/categorias"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:scale-[1.03]"
          >
            Explorar convites <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
