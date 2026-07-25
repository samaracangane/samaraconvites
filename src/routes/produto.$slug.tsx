import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { useStoreCatalog, useStoreProduct } from "@/lib/store-queries";
import { formatBRL } from "@/lib/mock-data";
import { ArrowLeft, Clock, Sparkles, Play, ShieldCheck, Heart } from "lucide-react";

export const Route = createFileRoute("/produto/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Convite ${params.slug} — Samara Encanto Convites` },
      { name: "description", content: "Convite digital personalizado com entrega em até 24h." },
      { property: "og:title", content: `Convite ${params.slug} — Samara Encanto Convites` },
      { property: "og:description", content: "Convite digital personalizado com entrega em até 24h." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useStoreProduct(slug);
  const { data: catalog } = useStoreCatalog();
  const related = (catalog?.products ?? []).filter((p) => p.slug !== slug).slice(0, 4);

  const hasVideo = product?.type === "video" && !!product.videoUrl;
  const mediaItems: Array<{ type: "video" | "image"; url: string; poster?: string }> = product
    ? [
        ...(hasVideo ? [{ type: "video" as const, url: product.videoUrl!, poster: product.image }] : []),
        ...product.gallery.map((url) => ({ type: "image" as const, url })),
      ]
    : [];
  // coverIndex: -1 = video first; 0..n = gallery index.
  // When video exists it occupies index 0 of mediaItems, so gallery index i → mediaItems[i+1].
  const initialIdx = (() => {
    if (!product) return 0;
    const ci = product.coverIndex ?? 0;
    if (hasVideo && ci === -1) return 0;
    const offset = hasVideo ? 1 : 0;
    const idx = offset + Math.max(0, ci === -1 ? 0 : ci);
    return Math.min(idx, mediaItems.length - 1);
  })();
  const [activeIdx, setActiveIdx] = useState(initialIdx);
  const active = mediaItems[activeIdx] ?? mediaItems[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-24 text-center text-muted-foreground">Carregando convite...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl">Convite não encontrado</h1>
          <Link to="/categorias" className="mt-4 inline-block font-bold text-primary">Ver todos os convites</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <Link to="/categorias" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-card">
              {active?.type === "video" ? (
                <video
                  key={active.url}
                  src={active.url}
                  poster={active.poster}
                  controls
                  autoPlay
                  playsInline
                  className="aspect-[9/16] w-full object-cover"
                />
              ) : (
                <img src={active?.url ?? product.image} alt={product.title} className="aspect-[9/16] w-full object-cover" />
              )}
              {product.type === "video" && active?.type !== "video" && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-soft backdrop-blur">
                  <Play className="h-3 w-3" /> Vídeo animado
                </span>
              )}
            </div>
            {mediaItems.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {mediaItems.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`relative aspect-[9/16] overflow-hidden rounded-xl border-2 transition ${
                      i === activeIdx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={m.type === "video" ? m.poster ?? product.image : m.url} alt="" className="h-full w-full object-cover" />
                    {m.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.categoryName && (
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{product.categoryName}</span>
            )}
            <h1 className="mt-1 font-display text-3xl md:text-4xl">{product.title}</h1>

            <div className="mt-4 flex items-end gap-3">
              {product.oldPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatBRL(product.oldPrice)}</span>
              )}
              <span className="text-4xl font-bold text-primary">{formatBRL(product.price)}</span>
              {product.onSale && (
                <span className="mb-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Promoção</span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/80">{product.description}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Clock className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Entrega</div>
                  <div className="text-sm font-bold">Em até {product.deliveryHours}h</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Pagamento</div>
                  <div className="text-sm font-bold">100% seguro</div>
                </div>
              </div>
            </div>

            <Link
              to="/personalizar/$slug"
              params={{ slug: product.slug }}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-gradient px-8 py-4 text-base font-bold text-primary-foreground shadow-glow transition hover:scale-[1.02] sm:w-auto"
            >
              <Sparkles className="h-4 w-4" /> Personalizar agora
            </Link>

            <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary">
              <Heart className="h-4 w-4" /> Salvar nos favoritos
            </button>

            {product.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {product.tags.map((t: string) => (
                  <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-6 font-display text-2xl">Você também pode gostar</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
