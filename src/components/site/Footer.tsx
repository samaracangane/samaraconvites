import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-gradient-to-b from-background to-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src={logo} alt="Samara Encanto Convites" className="h-14 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Convites digitais infantis feitos com muito carinho. Encanto,
            magia e delicadeza para o momento mais especial da sua família.
          </p>
          <div className="mt-5 flex gap-2">
            <a href="#" aria-label="Instagram" className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary/20"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="WhatsApp" className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary/20"><MessageCircle className="h-4 w-4" /></a>
            <a href="#" aria-label="E-mail" className="rounded-full bg-primary/10 p-2.5 text-primary hover:bg-primary/20"><Mail className="h-4 w-4" /></a>
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
            <li>Como funciona</li>
            <li>Prazo de entrega</li>
            <li>Formas de pagamento</li>
            <li>Perguntas frequentes</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Samara Encanto Convites · Feito com 💗 para momentos únicos
      </div>
    </footer>
  );
}
