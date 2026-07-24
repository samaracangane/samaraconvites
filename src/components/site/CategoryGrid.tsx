import { Link } from "@tanstack/react-router";
import { useStoreCategories } from "@/lib/store-queries";

const bgClass: Record<string, string> = {
  blush: "bg-blush",
  lilac: "bg-lilac",
  sky: "bg-sky",
  mint: "bg-mint",
  sunny: "bg-sunny",
  cream: "bg-cream",
};

export function CategoryGrid({ limit }: { limit?: number }) {
  const { data = [], isLoading } = useStoreCategories();
  const list = limit ? data.slice(0, limit) : data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {Array.from({ length: limit ?? 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Nenhuma categoria cadastrada ainda. Adicione categorias no painel administrativo. ✨
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
      {list.map((c) => (
        <Link
          key={c.slug}
          to="/categoria/$slug"
          params={{ slug: c.slug }}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card p-4 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
        >
          <div
            className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl text-3xl transition-transform group-hover:scale-110 ${
              bgClass[c.color] ?? "bg-muted"
            }`}
          >
            {c.image ? (
              <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
            ) : (
              c.emoji
            )}
          </div>
          <span className="text-xs font-semibold leading-tight text-foreground/80">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
