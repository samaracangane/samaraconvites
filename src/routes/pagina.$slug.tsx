import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useStorePage } from "@/lib/store-queries";

export const Route = createFileRoute("/pagina/$slug")({
  head: () => ({
    meta: [
      { title: "Informações — Samara Encanto Convites" },
      {
        name: "description",
        content:
          "Páginas informativas da Samara Encanto Convites: como comprar, prazos, pagamento e políticas.",
      },
      { property: "og:title", content: "Informações — Samara Encanto Convites" },
      {
        property: "og:description",
        content: "Tudo o que você precisa saber para encomendar seu convite digital.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaginaInstitucional,
});

function renderContent(content: string) {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  if (looksLikeHtml) {
    return (
      <div
        className="space-y-4 text-base leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
      {content
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
    </div>
  );
}

function PaginaInstitucional() {
  const { slug } = Route.useParams();
  const { data: page, isLoading } = useStorePage(slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-4 py-16">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-9 w-2/3 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-muted" />
          </div>
        ) : !page ? (
          <div className="text-center">
            <h1 className="font-display text-3xl">Página não encontrada 💗</h1>
            <p className="mt-3 text-muted-foreground">
              Este conteúdo pode ter sido removido ou ainda não está publicado.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Voltar para a loja
            </Link>
          </div>
        ) : (
          <>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Samara Encanto Convites
            </span>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{page.title}</h1>
            {page.meta_description && (
              <p className="mt-3 text-base text-muted-foreground">{page.meta_description}</p>
            )}
            <div className="mt-8">{page.content ? renderContent(page.content) : null}</div>
          </>
        )}
      </article>
      <Footer />
    </div>
  );
}
