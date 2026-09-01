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

      <div className="w-full bg-primary px-4 py-4 shadow-soft md:py-5">
        <p className="mx-auto max-w-4xl text-center font-script text-lg leading-relaxed text-sunny md:text-2xl">
          Escolha seu tema, envie os dados da sua festa e receba seu convite personalizado pronto para compartilhar pelo WhatsApp.
        </p>
      </div>
    </section>
  );
}
