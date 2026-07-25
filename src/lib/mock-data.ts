import princess from "@/assets/product-princess.jpg";
import safari from "@/assets/product-safari.jpg";
import hero from "@/assets/product-hero.jpg";
import baby from "@/assets/product-baby.jpg";
import unicorn from "@/assets/product-unicorn.jpg";
import dino from "@/assets/product-dino.jpg";

export type Category = {
  slug: string;
  name: string;
  emoji: string;
  color: string;
};

export type Product = {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  type: "imagem" | "video";
  price: number;
  oldPrice?: number;
  image: string;
  gallery: string[];
  videoUrl?: string;
  description: string;
  deliveryHours: number;
  tags: string[];
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  coverIndex?: number;
};

export const categories: Category[] = [
  { slug: "aniversario-infantil", name: "Aniversário Infantil", emoji: "🎂", color: "blush" },
  { slug: "meninas", name: "Meninas", emoji: "🎀", color: "blush" },
  { slug: "meninos", name: "Meninos", emoji: "⭐", color: "sky" },
  { slug: "safari", name: "Safari", emoji: "🦁", color: "sunny" },
  { slug: "princesas", name: "Princesas", emoji: "👑", color: "lilac" },
  { slug: "super-herois", name: "Super-Heróis", emoji: "🦸", color: "sky" },
  { slug: "cha-de-bebe", name: "Chá de Bebê", emoji: "🍼", color: "lilac" },
  { slug: "mesversario", name: "Mêsversário", emoji: "🌙", color: "mint" },
  { slug: "batizado", name: "Batizado", emoji: "🕊️", color: "cream" },
  { slug: "adulto", name: "Adulto", emoji: "🥂", color: "lilac" },
  { slug: "15-anos", name: "15 Anos", emoji: "💎", color: "blush" },
  { slug: "casamento", name: "Casamento", emoji: "💍", color: "cream" },
];

export const products: Product[] = [
  {
    slug: "convite-princesa-encantada",
    title: "Princesa Encantada",
    category: "princesas",
    categoryName: "Princesas",
    type: "video",
    price: 39.9,
    oldPrice: 59.9,
    image: princess,
    gallery: [princess],
    description:
      "Convite em vídeo animado com narração, música e transições mágicas. Ideal para festas de princesa com toque real de encantamento.",
    deliveryHours: 24,
    tags: ["princesa", "rosa", "dourado", "meninas"],
    featured: true,
    bestseller: true,
    onSale: true,
  },
  {
    slug: "convite-unicornio-magico",
    title: "Unicórnio Mágico",
    category: "meninas",
    categoryName: "Meninas",
    type: "video",
    price: 44.9,
    image: unicorn,
    gallery: [unicorn],
    description:
      "Convite em vídeo com unicórnio, arco-íris e brilho mágico. Perfeito para tornar a festa dos sonhos ainda mais especial.",
    deliveryHours: 24,
    tags: ["unicornio", "arco-iris", "meninas", "colorido"],
    featured: true,
    isNew: true,
  },
  {
    slug: "convite-safari-aventura",
    title: "Safari Aventura",
    category: "safari",
    categoryName: "Safari",
    type: "imagem",
    price: 24.9,
    image: safari,
    gallery: [safari],
    description:
      "Convite ilustrado com animais fofinhos da selva. Cores alegres e diagramação premium pronta para enviar.",
    deliveryHours: 24,
    tags: ["safari", "animais", "selva"],
    featured: true,
    bestseller: true,
  },
  {
    slug: "convite-super-heroi",
    title: "Super Herói em Ação",
    category: "super-herois",
    categoryName: "Super-Heróis",
    type: "video",
    price: 44.9,
    image: hero,
    gallery: [hero],
    description:
      "Convite em vídeo cinematográfico com efeitos de super-herói, ideal para meninos que sonham em salvar o dia.",
    deliveryHours: 24,
    tags: ["heroi", "meninos", "acao"],
    featured: true,
    isNew: true,
  },
  {
    slug: "convite-cha-de-bebe-nuvem",
    title: "Chá de Bebê Nuvem",
    category: "cha-de-bebe",
    categoryName: "Chá de Bebê",
    type: "imagem",
    price: 22.9,
    image: baby,
    gallery: [baby],
    description:
      "Convite delicado com lua, estrelas e nuvens. Tons pastel para acolher a chegada do bebê com muito carinho.",
    deliveryHours: 24,
    tags: ["bebe", "cha", "lilas", "delicado"],
    bestseller: true,
  },
  {
    slug: "convite-dinossauro-feliz",
    title: "Dinossauro Feliz",
    category: "meninos",
    categoryName: "Meninos",
    type: "imagem",
    price: 24.9,
    oldPrice: 34.9,
    image: dino,
    gallery: [dino],
    description:
      "Ilustração fofa de dinossauros para uma festa cheia de aventura. Arte pronta e personalizada em até 24h.",
    deliveryHours: 24,
    tags: ["dinossauro", "meninos", "aventura"],
    onSale: true,
    isNew: true,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}
export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
