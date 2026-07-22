import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { categories, getProductsByCategory } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/categoria/$slug")({
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat, items: getProductsByCategory(params.slug) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cat.name} — Samara Encanto Convites` },
          { name: "description", content: `Convites digitais de ${loaderData.cat.name} para festas infantis inesquecíveis.` },
          { property: "og:title", content: `${loaderData.cat.name} — Samara Encanto Convites` },
          { property: "og:description", content: `Convites de ${loaderData.cat.name} personalizados com entrega em 24h.` },
        ]
      : [{ title: "Categoria — Samara Encanto Convites" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Categoria não encontrada</h1>
        <Link to="/categorias" className="mt-4 inline-block font-bold text-primary">Ver categorias</Link>
      </div>
      <Footer />
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, items } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <Link to="/categorias" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Todas as categorias
        </Link>
        <div className="mb-10">
          <div className="text-5xl">{cat.emoji}</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">{cat.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{items.length} convite(s) disponível(is)</p>
        </div>
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Em breve novos convites nesta categoria! ✨
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {items.map((p: (typeof items)[number]) => <ProductCard key={p.slug} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
