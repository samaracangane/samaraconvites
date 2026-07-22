import { Link } from "@tanstack/react-router";
import { categories } from "@/lib/mock-data";

const bgClass: Record<string, string> = {
  blush: "bg-blush",
  lilac: "bg-lilac",
  sky: "bg-sky",
  mint: "bg-mint",
  sunny: "bg-sunny",
  cream: "bg-cream",
};

export function CategoryGrid({ limit }: { limit?: number }) {
  const list = limit ? categories.slice(0, limit) : categories;
  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
      {list.map((c) => (
        <Link
          key={c.slug}
          to="/categoria/$slug"
          params={{ slug: c.slug }}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card p-4 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
        >
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-110 ${bgClass[c.color] ?? "bg-muted"}`}>
            {c.emoji}
          </div>
          <span className="text-xs font-semibold leading-tight text-foreground/80">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
