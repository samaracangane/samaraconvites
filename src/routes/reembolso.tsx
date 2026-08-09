import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/reembolso")({
  head: () => ({
    meta: [
      { title: "Política de Reembolso — Samara Encanto Convites" },
      {
        name: "description",
        content:
          "Garantia de 30 dias: como solicitar reembolso dos convites digitais da Samara Encanto Convites.",
      },
      { property: "og:title", content: "Política de Reembolso — Samara Encanto Convites" },
      {
        property: "og:description",
        content: "Saiba como pedir reembolso da sua compra em até 30 dias.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReembolsoPage,
});

function ReembolsoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <article className="mx-auto max-w-3xl px-4 py-16">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Samara Encanto Convites
        </span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Política de Reembolso</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Última atualização: 03 de agosto de 2026
        </p>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl text-foreground">Garantia de 30 dias</h2>
            <p className="mt-2">
              Queremos que você fique encantada com o seu convite. Por isso, a{" "}
              <strong className="text-foreground">Samara Encanto Convites</strong> oferece uma
              garantia de satisfação de 30 dias: se você não ficar satisfeita com a sua compra, pode
              solicitar o reembolso integral em até 30 dias a partir da data do pedido.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Como solicitar</h2>
            <p className="mt-2">
              Os pagamentos são recebidos por PIX ou cartão de crédito via Asaas e os reembolsos são solicitados diretamente
              conosco. Para pedir o reembolso, fale com a gente pela{" "}
              <Link to="/contato" className="text-primary underline">
                página de contato
              </Link>{" "}
              que encaminhamos a solicitação para você.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Prazos e devolução do valor</h2>
            <p className="mt-2">
              Após a aprovação, o valor é devolvido pelo mesmo meio de pagamento utilizado. O prazo
              do PIX de devolução depende do seu banco e costuma levar de 1 a 5 dias
              úteis. Reembolsos de compras via Pix são creditados na chave/conta de origem.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Ajustes antes do reembolso</h2>
            <p className="mt-2">
              Se algo no seu convite não ficou como esperado (nome, data, horário, local ou arte),
              conte com a gente: ajustamos o arquivo sem custo adicional. Muitas vezes um pequeno
              ajuste resolve — mas se ainda assim você preferir o reembolso dentro dos 30 dias, ele
              será feito normalmente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground">Mais informações</h2>
            <p className="mt-2">
              Esta política complementa o Código de Defesa do Consumidor e os{" "}
              <Link to="/termos" className="text-primary underline">
                nossos Termos e Condições
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  );
}
