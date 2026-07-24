import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { useStoreCategory } from "@/lib/store-queries";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/categoria/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Categoria ${params.slug} — Samara Encanto Convites` },
      { name: "description", content: `Convites digitais desta categoria para festas infantis inesquecíveis.` },
      { property: "og:title", content: `Categoria ${params.slug} — Samara Encanto Convites` },
      { property: "og:description", content: `Convites personalizados com entrega em 24h.` },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useStoreCategory(slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <Link to="/categorias" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Todas as categorias
        </Link>

        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Carregando...</div>
        ) : !data ? (
          <div className="py-20 text-center">
            <h1 className="font-display text-3xl">Categoria não encontrada</h1>
            <Link to="/categorias" className="mt-4 inline-block font-bold text-primary">Ver categorias</Link>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <div className="text-5xl">{data.category.emoji}</div>
              <h1 className="mt-2 font-display text-4xl md:text-5xl">{data.category.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{data.items.length} convite(s) disponível(is)</p>
            </div>
            {data.items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                Em breve novos convites nesta categoria! ✨
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {data.items.map((p) => <ProductCard key={p.slug} product={p} />)}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
