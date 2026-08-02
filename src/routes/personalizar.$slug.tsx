import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { formatBRL } from "@/lib/mock-data";
import { useStoreProduct } from "@/lib/store-queries";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/admin-media";
import { ArrowLeft, Sparkles, Upload, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const Route = createFileRoute("/personalizar/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Personalizar ${params.slug} — Samara Encanto Convites` },
      { name: "description", content: "Personalize os dados do seu convite digital em minutos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PersonalizarPage,
});


function Field({
  label, required, children, hint,
}: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-foreground/70">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

function PersonalizarPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useStoreProduct(slug);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const { openCheckout } = usePaddleCheckout();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="py-24 text-center text-muted-foreground">Carregando...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl">Convite não encontrado</h1>
          <Link to="/categorias" className="mt-4 inline-block font-bold text-primary">Ver convites</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl">Pedido registrado! 💗</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Recebemos os dados do seu convite. Em breve entraremos em contato para confirmar o pagamento.
          </p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow">
            Voltar para a loja
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const get = (k: string) => (fd.get(k)?.toString().trim() || null);

      let photo_url: string | null = null;
      let music_url: string | null = null;
      if (photoFile) {
        try { photo_url = await uploadMedia(photoFile, "orders"); } catch { /* opcional */ }
      }
      if (musicFile) {
        try { music_url = await uploadMedia(musicFile, "orders"); } catch { /* opcional */ }
      }

      const customerEmail = get("customer_email");
      const orderId = crypto.randomUUID();
      const { error } = await supabase.from("orders").insert({
        id: orderId,
        product_id: product.id,
        product_title: product.title,
        product_slug: product.slug,
        price: product.price,
        status: "pending",
        customer_name: get("customer_name") ?? "",
        customer_email: customerEmail,
        customer_phone: get("customer_phone") ?? "",
        child_name: get("child_name") ?? "",
        child_age: get("child_age"),
        party_date: get("party_date"),
        party_time: get("party_time"),
        party_location: get("party_location"),
        party_address: get("party_address"),
        party_map_url: get("party_map_url"),
        message: get("message"),
        clothing_size: get("clothing_size"),
        shoe_size: get("shoe_size"),
        gift_type: get("gift_type"),
        notes: get("notes"),
        photo_url,
        music_url,
      });
      if (error) throw error;

      if (product.paddlePriceId) {
        await openCheckout({
          priceId: product.paddlePriceId,
          customerEmail: customerEmail ?? undefined,
          customData: { orderId },
          successUrl: `${window.location.origin}/pedido-confirmado`,
        });
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar pedido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link
          to="/produto/$slug"
          params={{ slug: product.slug }}
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o convite
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border/60 bg-card p-6 shadow-card md:p-8"
          >
            <h1 className="font-display text-3xl">Personalizar convite</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha os dados abaixo para deixarmos seu convite perfeito. Campos com * são obrigatórios.
            </p>

            <section className="mt-8">
              <h2 className="mb-4 font-display text-lg">Seus dados</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Seu nome" required><input required name="customer_name" className={inputCls} placeholder="Ex: Maria" /></Field>
                <Field label="Celular com DDD" required><input required name="customer_phone" type="tel" className={inputCls} placeholder="(11) 99999-9999" /></Field>
                <Field label="E-mail"><input name="customer_email" type="email" className={inputCls} placeholder="voce@email.com" /></Field>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="mb-4 font-display text-lg">Sobre a festa</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome do aniversariante" required><input required name="child_name" className={inputCls} placeholder="Ex: Alice" /></Field>
                <Field label="Idade" required><input required name="child_age" className={inputCls} placeholder="Ex: 4" /></Field>
                <Field label="Data" required><input required name="party_date" type="date" className={inputCls} /></Field>
                <Field label="Horário" required><input required name="party_time" type="time" className={inputCls} /></Field>
                <Field label="Local (nome)" required><input required name="party_location" className={inputCls} placeholder="Ex: Buffet Encanto" /></Field>
                <Field label="Endereço completo" required><input required name="party_address" className={inputCls} placeholder="Rua, número, bairro, cidade" /></Field>
                <Field label="Link da localização (Google Maps)"><input name="party_map_url" type="url" className={inputCls} placeholder="https://maps.google.com/..." /></Field>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="mb-4 font-display text-lg">Mensagem e detalhes</h2>
              <div className="grid gap-4">
                <Field label="Mensagem personalizada" required hint="Aparecerá no convite">
                  <textarea required name="message" rows={3} className={inputCls} placeholder="Ex: Com muito carinho, convidamos você para..." />
                </Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Tamanho da roupa"><input name="clothing_size" className={inputCls} placeholder="Ex: 4 anos" /></Field>
                  <Field label="Tamanho do calçado"><input name="shoe_size" className={inputCls} placeholder="Ex: 26" /></Field>
                  <Field label="Tipo de presente"><input name="gift_type" className={inputCls} placeholder="Ex: brinquedos" /></Field>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="mb-4 font-display text-lg">Envie sua foto e música</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Foto do aniversariante" hint="PNG, JPG ou WEBP">
                  <UploadInput accept="image/png,image/jpeg,image/webp" onFile={setPhotoFile} />
                </Field>
                {product.type === "video" && (
                  <Field label="Música para o vídeo" hint="MP3, opcional">
                    <UploadInput accept="audio/mpeg,audio/mp3" onFile={setMusicFile} />
                  </Field>
                )}
              </div>
            </section>

            <section className="mt-10">
              <Field label="Observações">
                <textarea name="notes" rows={3} className={inputCls} placeholder="Alguma preferência especial?" />
              </Field>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-gradient px-8 py-4 text-base font-bold text-primary-foreground shadow-glow transition hover:scale-[1.01] disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />{" "}
              {saving
                ? "Processando..."
                : product.paddlePriceId
                  ? `Pagar ${formatBRL(product.price)}`
                  : "Enviar pedido"}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Pagamento seguro. Você receberá a confirmação por e-mail assim que o pagamento for aprovado.
            </p>
          </form>

          {/* Resumo */}
          <aside className="h-fit rounded-3xl border border-border/60 bg-card p-5 shadow-card lg:sticky lg:top-24">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">Seu convite</div>
            <div className="mt-3 overflow-hidden rounded-2xl">
              <img src={product.image} alt={product.title} className="aspect-[4/5] w-full object-cover" />
            </div>
            <h3 className="mt-3 font-display text-lg">{product.title}</h3>
            <div className="text-xs text-muted-foreground">{product.categoryName}</div>
            <div className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-4">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">{formatBRL(product.price)}</span>
            </div>
            <div className="mt-3 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              ⏱️ Entrega em até {product.deliveryHours}h após pagamento
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function UploadInput({ accept, onFile }: { accept: string; onFile?: (f: File | null) => void }) {
  const [name, setName] = useState<string | null>(null);
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-3.5 py-3 text-sm transition hover:border-primary hover:bg-primary/5">
      <Upload className="h-4 w-4 text-primary" />
      <span className="flex-1 truncate text-foreground/80">
        {name ?? "Clique para enviar"}
      </span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setName(f?.name ?? null);
          onFile?.(f);
        }}
      />
    </label>
  );
}
