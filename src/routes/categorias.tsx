import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionTitle } from "@/components/site/SectionTitle";
import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — Samara Encanto Convites" },
      { name: "description", content: "Explore todas as categorias de convites digitais infantis: princesas, super-heróis, safari, chá de bebê e muito mais." },
      { property: "og:title", content: "Categorias — Samara Encanto Convites" },
      { property: "og:description", content: "Explore todas as categorias de convites digitais infantis." },
    ],
  }),
  component: Categorias,
});

function Categorias() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Escolha o tema</span>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Todas as categorias</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Encontre o convite perfeito para cada ocasião especial.
          </p>
        </div>
        <CategoryGrid />

        <div className="mt-16">
          <SectionTitle eyebrow="Toda a vitrine" title="Convites disponíveis" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
