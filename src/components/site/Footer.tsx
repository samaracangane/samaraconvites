import { Link } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";
import logo from "@/assets/logo.png";
import { useStorePages } from "@/lib/store-queries";
import { BUSINESS, BUSINESS_ADDRESS } from "@/lib/business";

export function Footer() {
  const { data: pages = [] } = useStorePages();
  return (
    <footer className="mt-24 border-t border-border/60 bg-gradient-to-b from-background to-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <img src={logo} alt="Samara Encanto Convites" className="h-14 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Convites digitais infantis personalizados, entregues por download em
            até 24 horas úteis. Encanto, magia e delicadeza para o momento mais
            especial da sua família.
          </p>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-primary">
                {BUSINESS.email}
              </a>
            </p>
            <p>{BUSINESS_ADDRESS}</p>
          </div>
          <div className="mt-5 flex gap-2">
            <a href={BUSINESS.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary/20"><Instagram className="h-4 w-4" /></a>
            <a href={`mailto:${BUSINESS.email}`} aria-label="E-mail" className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary/20"><Mail className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground/80">Navegue</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">Início</Link></li>
            <li><Link to="/categorias" className="hover:text-primary">Categorias</Link></li>
            <li><Link to="/sobre" className="hover:text-primary">Sobre</Link></li>
            <li><Link to="/contato" className="hover:text-primary">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground/80">Ajuda</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/como-comprar" className="hover:text-primary">Como comprar</Link></li>
            <li><Link to="/reembolso" className="hover:text-primary">Reembolso</Link></li>
            {pages.map((p) => (
              <li key={p.id}>
                <Link to="/pagina/$slug" params={{ slug: p.slug }} className="hover:text-primary">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground/80">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/termos" className="hover:text-primary">Termos e Condições</Link></li>
            <li><Link to="/privacidade" className="hover:text-primary">Política de Privacidade</Link></li>
            <li><Link to="/reembolso" className="hover:text-primary">Política de Reembolso</Link></li>
          </ul>
        </div>
      </div>
      <div className="space-y-1 border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {BUSINESS.brand} · {BUSINESS_ADDRESS}
        </p>
        <p>
          Pagamento via PIX ou cartão de crédito (Asaas). A venda é
          realizada diretamente por {BUSINESS.brand}.
        </p>
      </div>
    </footer>
  );
}

