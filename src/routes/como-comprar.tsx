import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/como-comprar")({
  head: () => ({
    meta: [
      { title: "Como comprar convites digitais — Samara Encanto Convites" },
      {
        name: "description",
        content:
          "Passo a passo para comprar um convite digital personalizado: escolha o modelo, preencha os dados da festa, pague por PIX e receba o arquivo em até 24h.",
      },
      { property: "og:title", content: "Como comprar — Samara Encanto Convites" },
      {
        property: "og:description",
        content: "Escolha, personalize, pague e receba seu convite digital em até 24 horas úteis.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComoComprar,
});

const steps = [
  {
    t: "1. Escolha o modelo",
    d: "Navegue pelo catálogo por tema e escolha entre convites em imagem estática, em vídeo animado ou interativos (link com contagem regressiva e confirmação de presença).",
  },
  {
    t: "2. Personalize",
    d: "Preencha o formulário com nome da criança, idade, data, horário e local da festa. Esses dados são obrigatórios e usados exatamente como enviados na arte final.",
  },
  {
    t: "3. Pague com segurança",
    d: "O pagamento é feito por PIX ou cartão de crédito, processado com segurança pelo Asaas: no PIX mostramos o QR Code e o código copia e cola na hora; no cartão você é levado ao checkout seguro do Asaas. Você recebe a confirmação por e-mail automaticamente.",
  },
  {
    t: "4. Receba seu convite",
    d: `Enviamos o arquivo final por e-mail e ele também fica disponível na sua página de acompanhamento do pedido, ${BUSINESS.deliveryTime}.`,
  },
  {
    t: "5. Ajustes e suporte",
    d: "Encontrou um erro de digitação? Fale com a gente pelo WhatsApp ou e-mail e corrigimos sem custo adicional.",
  },
];

function ComoComprar() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{BUSINESS.brand}</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Como comprar</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Vendemos convites digitais infantis personalizados — arquivos entregues por download, sem produto
          físico e sem frete. Veja como funciona do início ao fim.
        </p>

        <ol className="mt-10 space-y-4">
          {steps.map((s) => (
            <li key={s.t} className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
              <h2 className="font-display text-xl text-foreground">{s.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>

        <section className="mt-10 rounded-3xl border border-border/60 bg-muted/40 p-6">
          <h2 className="font-display text-xl text-foreground">O que você recebe</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Arquivo digital em alta resolução (JPG/PNG) ou vídeo (MP4), conforme o modelo escolhido.</li>
            <li>Convites interativos são entregues como link exclusivo, válido por 12 meses.</li>
            <li>Uso pessoal e não comercial, para uma única festa.</li>
            <li>Entrega 100% digital — nada é enviado pelos Correios.</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Preços e prazos aparecem na página de cada convite. Consulte também nossos{" "}
            <Link to="/termos" className="text-primary underline">
              Termos e Condições
            </Link>
            ,{" "}
            <Link to="/reembolso" className="text-primary underline">
              Política de Reembolso
            </Link>{" "}
            e{" "}
            <Link to="/privacidade" className="text-primary underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </section>

        <p className="mt-8 text-sm text-muted-foreground">
          Ainda com dúvidas? Fale com a gente pelo WhatsApp{" "}
          <a href={BUSINESS.whatsappUrl} className="text-primary underline" target="_blank" rel="noopener noreferrer">
            {BUSINESS.whatsappDisplay}
          </a>{" "}
          ou pelo e-mail{" "}
          <a href={`mailto:${BUSINESS.email}`} className="text-primary underline">
            {BUSINESS.email}
          </a>
          .
        </p>
      </article>
      <Footer />
    </div>
  );
}
