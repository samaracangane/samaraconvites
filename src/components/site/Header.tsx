import { Link } from "@tanstack/react-router";
import { Search, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { useStoreCategories } from "@/lib/store-queries";

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: categories = [] } = useStoreCategories();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-foreground/70 hover:bg-muted md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Samara Encanto Convites" className="h-12 w-auto md:h-14" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-foreground/75 md:flex">
          <Link to="/" className="hover:text-primary transition-colors">Início</Link>
          <Link to="/categorias" className="hover:text-primary transition-colors">Produtos</Link>
          <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
          <Link to="/sobre" className="hover:text-primary transition-colors">Quem somos</Link>
          <Link to="/como-comprar" className="hover:text-primary transition-colors">Como comprar</Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Buscar"
            className="rounded-full p-2 text-foreground/70 hover:bg-muted"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            aria-label="Favoritos"
            className="hidden rounded-full p-2 text-foreground/70 hover:bg-muted sm:block"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Barra roxa de navegação (estilo do banner) */}
      <div className="bg-navbar text-navbar-foreground">
        <nav className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider md:justify-center md:gap-10 md:text-sm">
          <Link to="/" className="whitespace-nowrap transition-opacity hover:opacity-75">Início</Link>
          <Link to="/categorias" className="whitespace-nowrap transition-opacity hover:opacity-75">Produtos</Link>
          <Link to="/contato" className="whitespace-nowrap transition-opacity hover:opacity-75">Contato</Link>
          <Link to="/sobre" className="whitespace-nowrap transition-opacity hover:opacity-75">Quem somos</Link>
          <Link to="/como-comprar" className="whitespace-nowrap transition-opacity hover:opacity-75">Como comprar</Link>
        </nav>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-sm font-semibold">
            <Link to="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-muted">Início</Link>
            <Link to="/categorias" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-muted">Produtos</Link>
            <Link to="/contato" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-muted">Contato</Link>
            <Link to="/sobre" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-muted">Quem somos</Link>
            <Link to="/como-comprar" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-muted">Como comprar</Link>
            <div className="mt-2 border-t border-border/60 pt-2 text-xs uppercase tracking-wider text-muted-foreground">Categorias populares</div>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-muted"
              >
                <span className="mr-2">{c.emoji}</span>{c.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

    </header>
  );
}
