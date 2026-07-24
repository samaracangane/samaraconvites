import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/mock-data";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  color: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  category_id: string | null;
  type: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  video_url: string | null;
  description: string | null;
  delivery_hours: number;
  tags: string[];
  gallery: unknown;
  featured: boolean;
  bestseller: boolean;
  is_new: boolean;
  on_sale: boolean;
  active: boolean;
  sort_order: number;
};

const PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'><rect width='100%' height='100%' fill='%23f3e8ff'/><text x='50%' y='50%' font-family='sans-serif' font-size='24' fill='%23a855f7' text-anchor='middle' dominant-baseline='middle'>💌</text></svg>";

export type StoreCategory = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  color: string;
  image?: string | null;
};

export function mapCategory(c: CategoryRow): StoreCategory {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    emoji: c.emoji ?? "✨",
    color: c.color ?? "blush",
    image: c.image_url,
  };
}

export function mapProduct(p: ProductRow, catBySlug: Record<string, string> = {}, catNameById: Record<string, string> = {}): Product {
  const categoryName = p.category_id ? catNameById[p.category_id] ?? "" : "";
  const categorySlug =
    p.category_id && Object.entries(catBySlug).find(([, id]) => id === p.category_id)?.[0];
  const image = p.image_url ?? PLACEHOLDER;
  const gallery = Array.isArray(p.gallery) && p.gallery.length > 0 ? (p.gallery as string[]) : [image];
  return {
    slug: p.slug,
    title: p.title,
    category: categorySlug ?? "",
    categoryName,
    type: (p.type === "video" ? "video" : "imagem") as Product["type"],
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    image,
    gallery,
    description: p.description ?? "",
    deliveryHours: p.delivery_hours,
    tags: p.tags ?? [],
    featured: p.featured,
    bestseller: p.bestseller,
    isNew: p.is_new,
    onSale: p.on_sale,
  };
}

async function fetchCategories(): Promise<StoreCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((c) => mapCategory(c as CategoryRow));
}

async function fetchProductsWithCategories(): Promise<{
  products: Product[];
  categories: StoreCategory[];
}> {
  const [cRes, pRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true }),
  ]);
  if (cRes.error) throw cRes.error;
  if (pRes.error) throw pRes.error;
  const cats = (cRes.data ?? []) as CategoryRow[];
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  const catNameById = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  const products = (pRes.data ?? []).map((p) => mapProduct(p as ProductRow, catBySlug, catNameById));
  return { products, categories: cats.filter((c) => c.active).map(mapCategory) };
}

export function useStoreCategories() {
  return useQuery({ queryKey: ["public", "categories"], queryFn: fetchCategories });
}

export function useStoreCatalog() {
  return useQuery({ queryKey: ["public", "catalog"], queryFn: fetchProductsWithCategories });
}

export function useStoreProduct(slug: string) {
  return useQuery({
    queryKey: ["public", "product", slug],
    queryFn: async () => {
      const [cRes, pRes] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle(),
      ]);
      if (cRes.error) throw cRes.error;
      if (pRes.error) throw pRes.error;
      if (!pRes.data) return null;
      const cats = (cRes.data ?? []) as CategoryRow[];
      const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
      const catNameById = Object.fromEntries(cats.map((c) => [c.id, c.name]));
      return mapProduct(pRes.data as ProductRow, catBySlug, catNameById);
    },
  });
}

export function useStoreCategory(slug: string) {
  return useQuery({
    queryKey: ["public", "category", slug],
    queryFn: async () => {
      const { data: cat, error: cErr } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();
      if (cErr) throw cErr;
      if (!cat) return null;
      const { data: prods, error: pErr } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("category_id", (cat as CategoryRow).id)
        .order("sort_order", { ascending: true });
      if (pErr) throw pErr;
      const catRow = cat as CategoryRow;
      const catBySlug = { [catRow.slug]: catRow.id };
      const catNameById = { [catRow.id]: catRow.name };
      return {
        category: mapCategory(catRow),
        items: (prods ?? []).map((p) => mapProduct(p as ProductRow, catBySlug, catNameById)),
      };
    },
  });
}
