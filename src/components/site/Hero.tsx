import { Link } from "@tanstack/react-router";
import bannerHero from "@/assets/banner-hero-v2.webp.asset.json";

export function Hero() {
  return (
    <section className="w-full">
      <Link to="/categorias" className="block">
        <img
          src={bannerHero.url}
          alt="Convites digitais personalizados para tornar sua festa ainda mais especial — aniversário, chá de bebê, chá revelação, casamento e 15 anos"
          width={1774}
          height={887}
          className="h-auto w-full object-cover"
          fetchPriority="high"
        />
      </Link>
      <p className="mx-auto max-w-3xl px-4 pt-5 text-center text-sm leading-relaxed text-foreground/80 md:pt-7 md:text-lg">
        Escolha seu tema, envie os dados da sua festa e receba seu convite personalizado pronto para compartilhar pelo WhatsApp.
      </p>
    </section>
  );
}
