import { Link } from "@tanstack/react-router";
import bannerHero from "@/assets/banner-hero.webp.asset.json";

export function Hero() {
  return (
    <section className="w-full">
      <Link to="/categorias" className="block">
        <img
          src={bannerHero.url}
          alt="Eu faço convites personalizados para tornar seu momento inesquecível — aniversário, chá de bebê, chá revelação, casamento e 15 anos"
          width={1920}
          height={833}
          className="h-auto w-full object-cover"
          fetchPriority="high"
        />
      </Link>
    </section>
  );
}
