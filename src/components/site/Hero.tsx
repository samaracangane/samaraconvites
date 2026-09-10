import { Link } from "@tanstack/react-router";
import bannerHero from "@/assets/banner-hero-v3.png.asset.json";

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

      <div className="h-2 w-full bg-primary md:h-3" />

      <p className="mx-auto max-w-4xl px-4 py-4 text-center font-display text-base leading-relaxed text-primary md:py-6 md:text-xl">
        Escolha seu tema, envie os dados da sua festa e receba seu convite personalizado pronto para compartilhar.
      </p>
    </section>
  );
}
