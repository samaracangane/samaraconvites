import { Link } from "@tanstack/react-router";
import { Play, Sparkles } from "lucide-react";
import { formatBRL, type Product } from "@/lib/mock-data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/produto/$slug"
      params={{ slug: product.slug }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-soft">Novo</span>
          )}
          {product.onSale && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-soft">Promo</span>
          )}
          {product.bestseller && (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground shadow-soft">Top</span>
          )}
        </div>
        {product.type === "video" && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-soft backdrop-blur">
            <Play className="h-3 w-3" /> Vídeo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {product.categoryName}
        </span>
        <h3 className="font-display text-lg leading-tight text-foreground">{product.title}</h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatBRL(product.oldPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-primary">{formatBRL(product.price)}</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
            <Sparkles className="h-3 w-3" /> 24h
          </span>
        </div>
      </div>
    </Link>
  );
}
