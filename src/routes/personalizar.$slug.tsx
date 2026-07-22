import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getProduct, formatBRL } from "@/lib/mock-data";
import { ArrowLeft, Sparkles, Upload, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/personalizar/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Personalizar ${loaderData.product.title} — Samara Encanto Convites` : "Personalizar convite" },
      { name: "description", content: "Personalize os dados do seu convite digital em minutos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Convite não encontrado</h1>
        <Link to="/categorias" className="mt-4 inline-block font-bold text-primary">Ver todos os convites</Link>
      </div>
      <Footer />
    </div>
  ),
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
  const { product } = Route.useLoaderData();
  const [submitted, setSubmitted] = useState(false);

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
            Recebemos os dados do seu convite. Em breve o pagamento estará disponível para você concluir a compra.
          </p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow">
            Voltar para a loja
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="rounded-3xl border border-border/60 bg-card p-6 shadow-card md:p-8"
          >
            <h1 className="font-display text-3xl">Personalizar convite</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha os dados abaixo para deixarmos seu convite perfeito. Campos com * são obrigatórios.
            </p>

            <section className="mt-8">
              <h2 className="mb-4 font-display text-lg">Sobre a festa</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome do aniversariante" required><input required className={inputCls} placeholder="Ex: Alice" /></Field>
                <Field label="Idade" required><input required type="number" min={0} className={inputCls} placeholder="Ex: 4" /></Field>
                <Field label="Data" required><input required type="date" className={inputCls} /></Field>
                <Field label="Horário" required><input required type="time" className={inputCls} /></Field>
                <Field label="Local (nome)" required><input required className={inputCls} placeholder="Ex: Buffet Encanto" /></Field>
                <Field label="Endereço completo" required><input required className={inputCls} placeholder="Rua, número, bairro, cidade" /></Field>
                <Field label="Link da localização (Google Maps)"><input type="url" className={inputCls} placeholder="https://maps.google.com/..." /></Field>
                <Field label="Celular com DDD" required><input required type="tel" className={inputCls} placeholder="(11) 99999-9999" /></Field>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="mb-4 font-display text-lg">Mensagem e detalhes</h2>
              <div className="grid gap-4">
                <Field label="Mensagem personalizada" required hint="Aparecerá no convite">
                  <textarea required rows={3} className={inputCls} placeholder="Ex: Com muito carinho, convidamos você para..." />
                </Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Tamanho da roupa"><input className={inputCls} placeholder="Ex: 4 anos" /></Field>
                  <Field label="Tamanho do calçado"><input className={inputCls} placeholder="Ex: 26" /></Field>
                  <Field label="Tipo de presente"><input className={inputCls} placeholder="Ex: brinquedos" /></Field>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="mb-4 font-display text-lg">Envie sua foto e música</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Foto do aniversariante" required hint="PNG, JPG ou WEBP">
                  <UploadInput accept="image/png,image/jpeg,image/webp" required />
                </Field>
                {product.type === "video" && (
                  <Field label="Música para o vídeo" hint="MP3, opcional">
                    <UploadInput accept="audio/mpeg,audio/mp3" />
                  </Field>
                )}
              </div>
            </section>

            <section className="mt-10">
              <Field label="Observações">
                <textarea rows={3} className={inputCls} placeholder="Alguma preferência especial?" />
              </Field>
            </section>

            <button
              type="submit"
              className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-gradient px-8 py-4 text-base font-bold text-primary-foreground shadow-glow transition hover:scale-[1.01]"
            >
              <Sparkles className="h-4 w-4" /> Continuar para pagamento
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              O pagamento seguro será integrado em breve. Você receberá confirmação por e-mail e WhatsApp.
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

function UploadInput({ accept, required }: { accept: string; required?: boolean }) {
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
        required={required}
        className="hidden"
        onChange={(e) => setName(e.target.files?.[0]?.name ?? null)}
      />
    </label>
  );
}
